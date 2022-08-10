import { ContextProvider } from "providers/context-provider";
import type { AppProps } from "next/app";
import Head from "next/head";
import MainLayout from "layouts/main";
import "styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>s ◎ l a r e</title>
      </Head>
      <ContextProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </ContextProvider>
    </>
  );
}
