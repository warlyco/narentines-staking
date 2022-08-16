import React, { ReactNode, useContext, useState } from "react";

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const LoadingContext = React.createContext({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
} as LoadingContextType);
const { Provider } = LoadingContext;

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, _setIsLoading] = useState(false);

  return (
    <Provider value={{ isLoading, setIsLoading: _setIsLoading }}>
      {children}
    </Provider>
  );
};

export const useIsLoading = () => {
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  return { isLoading, setIsLoading };
};
