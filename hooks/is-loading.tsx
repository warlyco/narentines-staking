import React, { ReactNode, useContext, useState } from "react";

type LoadingContextType = {
  isLoading: boolean;
  loadingMessage: string | null;
  setIsLoading: (isLoading: boolean, message?: string) => void;
  setLoadingMessage: (message: string) => void;
};

const LoadingContext = React.createContext({
  isLoading: false,
  setIsLoading: (isLoading: boolean, message?: string) => {},
  setLoadingMessage: (message: string) => {},
} as LoadingContextType);
const { Provider } = LoadingContext;

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, _setIsLoading] = useState(false);
  const [loadingMessage, _setLoadingMessgage] = useState<string | null>(null);

  const handleSetIsLoading = (isLoading: boolean, message?: string) => {
    _setIsLoading(isLoading);
    if (!isLoading) {
      _setLoadingMessgage(null);
      return;
    }
    if (message?.length) {
      _setLoadingMessgage(message);
    }
  };

  return (
    <Provider
      value={{
        isLoading,
        loadingMessage,
        setIsLoading: handleSetIsLoading,
        setLoadingMessage: _setLoadingMessgage,
      }}
    >
      {children}
    </Provider>
  );
};

export const useIsLoading = () => {
  const { isLoading, setIsLoading, loadingMessage, setLoadingMessage } =
    useContext(LoadingContext);
  return { isLoading, setIsLoading, loadingMessage, setLoadingMessage };
};
