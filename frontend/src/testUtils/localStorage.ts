import { UserData } from "../components/header/userData/userData";

export const setUserData = (
  userData: Partial<Omit<UserData, "meta">>
): void => {
  localStorage.setItem("portfolios", "{}");
  localStorage.setItem("assets", "{}");
  localStorage.setItem("apiKeys", JSON.stringify({ yahoo: "" }));

  if (userData.portfolios) {
    localStorage.setItem("portfolios", JSON.stringify(userData.portfolios));
  }
  if (userData.assets) {
    localStorage.setItem("assets", JSON.stringify(userData.assets));
  }
  if (userData.apiKeys) {
    localStorage.setItem("apiKeys", JSON.stringify(userData.apiKeys));
  }
};
