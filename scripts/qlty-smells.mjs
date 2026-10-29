#!/usr/bin/env node
// Report or gate maintainability smells with qlty.
//
//   node scripts/qlty-smells.mjs
//     Report all findings. Does not fail.
//
//   node scripts/qlty-smells.mjs --base origin/main
//     Fail on findings that touch lines added since the merge base.
import { execFileSync } from "node:child_process";

const MAX_BUFFER = 64 * 1024 * 1024;
const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const base = baseIndex === -1 ? undefined : args[baseIndex + 1];

if (baseIndex !== -1 && !base) {
  console.error("usage: node scripts/qlty-smells.mjs [--base REF]");
  process.exit(2);
}

function run(command, commandArgs) {
  try {
    return execFileSync(command, commandArgs, {
      encoding: "utf8",
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    const hint =
      command === "qlty"
        ? "qlty is not installed. Install it from https://qlty.sh"
        : `${command} is not installed`;

    if (error.code === "ENOENT") {
      console.error(hint);
    } else if (error.stderr) {
      process.stderr.write(error.stderr);
    }

    process.exit(error.status ?? 1);
    return undefined;
  }
}

function smells(extraArgs) {
  const sarif = run("qlty", ["smells", ...extraArgs, "--sarif"]);
  return JSON.parse(sarif).runs.flatMap((entry) => entry.results ?? []);
}

function message(result) {
  return result.message?.text ?? "";
}

function reportAll() {
  const results = smells(["--all"]);

  for (const result of results) {
    const location = result.locations?.[0]?.physicalLocation;
    const path = decodeURIComponent(location?.artifactLocation?.uri ?? "?");
    const line = location?.region?.startLine ?? "?";
    console.log(`${path}:${line} ${result.ruleId}: ${message(result)}`);
  }

  console.log(`qlty smells: ${results.length} finding(s)`);
}

function addedLines(diff) {
  const added = new Map();
  let currentPath = null;

  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ ")) {
      const path = line.slice(4).trim();
      currentPath = path === "/dev/null" ? null : path.replace(/^b\//, "");
      continue;
    }

    const match = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (!match || currentPath === null) {
      continue;
    }

    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    if (count === 0) {
      continue;
    }

    const ranges = added.get(currentPath) ?? [];
    ranges.push([start, start + count - 1]);
    added.set(currentPath, ranges);
  }

  return added;
}

function blockingLocation(result, added) {
  const locations = [
    ...(result.locations ?? []),
    ...(result.relatedLocations ?? []),
  ];

  for (const location of locations) {
    const physical = location.physicalLocation;
    const path = decodeURIComponent(physical?.artifactLocation?.uri ?? "");
    const ranges = added.get(path);
    if (!ranges) {
      continue;
    }

    const start = physical?.region?.startLine ?? 1;
    const end = physical?.region?.endLine ?? start;
    if (ranges.some(([from, to]) => start <= to && end >= from)) {
      return { path, line: start };
    }
  }

  return undefined;
}

function gate() {
  const mergeBase = run("git", ["merge-base", base, "HEAD"]).trim();
  const results = smells(["--upstream", mergeBase]);
  const diff = run("git", [
    "diff",
    "--unified=0",
    "--no-color",
    "--no-ext-diff",
    mergeBase,
  ]);
  const added = addedLines(diff);
  const blocked = [];

  for (const result of results) {
    const location = blockingLocation(result, added);
    if (location) {
      blocked.push({ result, ...location });
    }
  }

  for (const { result, path, line } of blocked) {
    console.log(`${path}:${line} ${result.ruleId}: ${message(result)}`);
  }

  console.log(
    `qlty smells: ${blocked.length} new finding(s) on changed lines (${results.length} total)`
  );

  if (blocked.length > 0) {
    process.exitCode = 1;
  }
}

if (base) {
  gate();
} else {
  reportAll();
}
