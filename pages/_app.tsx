import { ContextProvider } from "providers/context-provider";
import type { AppProps } from "next/app";
import Head from "next/head";
import MainLayout from "layouts/main";
import "styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { LoadingProvider } from "hooks/is-loading";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>The Pond</title>
      </Head>
      <ContextProvider>
        <LoadingProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </LoadingProvider>
      </ContextProvider>
    </>
  );
}
