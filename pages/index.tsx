import { Metadata, Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { STAKING_WALLET_ADDRESS } from "constants/constants";
import ClientOnly from "features/client-only";
import NftListWrapper from "features/user-nft-list";
import UserNftList from "features/user-nft-list";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";

const Home: NextPage = () => {
  const [activeWallet, setActiveWallet] = useState<WalletTypes>(
    WalletTypes.USER
  );
  const [selectedWalletNfts, setSelectedWalletNfts] = useState<
    Metadata[] | null
  >(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const fetchNfts = useCallback(async () => {
    setIsLoadingNfts(true);
    const ownerToSearch =
      activeWallet === WalletTypes.USER
        ? publicKey?.toString()
        : STAKING_WALLET_ADDRESS;
    try {
      const metaplex = Metaplex.make(connection);
      const nfts = await metaplex.nfts().findAllByOwner(ownerToSearch).run();
      setSelectedWalletNfts(nfts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [activeWallet, connection, publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    fetchNfts();
  }, [fetchNfts, publicKey]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen -mt-24">
        <h1 className="mb-8 text-6xl uppercase">the pond</h1>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex">
      <div className="max-w-5xl p-4 text-2xl w-full">
        <ClientOnly>
          <div className="flex pb-4 justify-between items-center">
            <div className="space-x-2">
              <button
                className={classNames({
                  "p-2 px-4 rounded font-medium uppercase text-2xl pt-2.5 border-2 border-green-800 tracking-wider":
                    true,
                  "bg-green-800 text-white": activeWallet === WalletTypes.USER,
                  "bg-transparent": activeWallet !== WalletTypes.USER,
                })}
                onClick={() => setActiveWallet(WalletTypes.USER)}
              >
                Wallet
              </button>
              <button
                className={classNames({
                  "p-2 px-4 rounded font-medium uppercase text-2xl pt-2.5 border-2 border-green-800 tracking-wider":
                    true,
                  "bg-green-800 text-white":
                    activeWallet === WalletTypes.STAKING,
                  "bg-transparent": activeWallet !== WalletTypes.STAKING,
                })}
                onClick={() => setActiveWallet(WalletTypes.STAKING)}
              >
                Staked
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {activeWallet === WalletTypes.USER &&
                !!selectedWalletNfts?.length && (
                  <button className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase">
                    Stake All
                  </button>
                )}
              <WalletMultiButton />
            </div>
          </div>
          <NftListWrapper
            activeWallet={activeWallet}
            nfts={selectedWalletNfts}
            isLoadingNfts={isLoadingNfts}
          />
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
