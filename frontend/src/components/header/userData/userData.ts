import { AssetLibrary, PortfolioLibrary } from "pt-domain";

export const EXPORT_VERSION = 2;

export type ApiKeys = {
  yahoo: string;
};

export type UserData = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  apiKeys: ApiKeys;
  meta: {
    exportVersion: typeof EXPORT_VERSION;
  };
};

export const parseUserData = (jsonString: string): UserData => {
  const parsedObject = JSON.parse(jsonString) as UserDataOfAnyVersion;
  if (!(parsedObject.assets && parsedObject.meta && parsedObject.portfolios)) {
    throw new Error(`cannot parse user data ${jsonString}`);
  }

  return doMigration(parsedObject);
};

/*
 * Data Migrations
 */

const doMigration = (data: UserDataOfAnyVersion): UserData =>
  // @ts-expect-error
  [getV2].reduce((result, reducer, i) => {
    // @ts-expect-error
    return result.meta.exportVersion <= i + 1 ? reducer(data) : data;
  }, data);

type UserDataOfAnyVersion = UserData | UserDataV1;

const getV2 = (userData: UserDataV1): UserData => ({
  ...userData,
  apiKeys: { yahoo: "" },
  meta: {
    exportVersion: 2,
  },
});

type UserDataV1 = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  apiKeys: ApiKeys;
  meta: {
    exportVersion: 1;
  };
};
