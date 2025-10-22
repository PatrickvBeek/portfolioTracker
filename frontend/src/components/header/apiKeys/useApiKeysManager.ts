import { useState } from "react";
import {
  useGetApiKeys,
  useSetApiKey,
} from "../../../hooks/apiKeys/apiKeyHooks";

export const useApiKeysManager = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [yahooKey, setYahooKey] = useState(useGetApiKeys()?.yahoo || "");
  const submitYahooKey = useSetApiKey("yahoo");

  const openApiKeys = () => setIsOverlayOpen(true);
  const closeApiKeys = () => setIsOverlayOpen(false);

  const handleSubmit = () => {
    submitYahooKey(yahooKey);
    closeApiKeys();
  };

  return {
    isOverlayOpen,
    yahooKey,
    setYahooKey,
    openApiKeys,
    closeApiKeys,
    handleSubmit,
  };
};
