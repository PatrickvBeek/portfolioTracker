module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    setupFilesAfterEnv:[ "<rootDir>/src/setupTests.ts"],
    transform: {
      ".+\\.(css|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
    },
  }