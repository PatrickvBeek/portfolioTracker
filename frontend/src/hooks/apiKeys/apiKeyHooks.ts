import { useContext } from "react";
import { ApiKeys } from "../../components/header/userData/userData";
import { UserDataContext } from "../../userDataContext";

export function useGetApiKeys(): ApiKeys | undefined {
  const { apiKeys } = useContext(UserDataContext);
  return apiKeys;
}

export function useSetApiKeys() {
  const { setApiKeys } = useContext(UserDataContext);

  return (apiKeys: ApiKeys) => {
    setApiKeys(apiKeys);
    localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
  };
}

export function useSetApiKey(keyType: keyof ApiKeys) {
  const { setApiKeys, apiKeys } = useContext(UserDataContext);

  return (keyValue: string) => {
    const updatedKeys = {
      ...apiKeys,
      [keyType]: keyValue,
    };
    setApiKeys(updatedKeys);
    localStorage.setItem("apiKeys", JSON.stringify(updatedKeys));
  };
}
