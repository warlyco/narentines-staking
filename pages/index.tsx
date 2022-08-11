import { Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { STAKING_WALLET_ADDRESS } from "constants/constants";
import ClientOnly from "features/client-only";
import NftListWrapper from "features/user-nft-list";
import UserNftList from "features/user-nft-list";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

enum WalletType {
  STAKING = "STAKING",
  USER = "USER",
}

const Home: NextPage = () => {
  const [activeWallet, setActiveWallet] = useState<WalletType>(WalletType.USER);
  const [selectedNfts, setSelectedNfts] = useState<Nft[] | null>(null);

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const fetchNfts = useCallback(async () => {
    const ownerToSearch =
      activeWallet === WalletType.USER
        ? publicKey?.toString()
        : STAKING_WALLET_ADDRESS;
    try {
      const metaplex = Metaplex.make(connection);
      const nfts = await metaplex.nfts().findAllByOwner(ownerToSearch).run();
      setSelectedNfts(nfts);
    } catch (error) {
      console.error(error);
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
          <div className="flex pb-4 justify-between">
            <div className="space-x-2">
              <button
                className={classNames({
                  "p-2 px-4 rounded font-bold uppercase text-xl pt-2.5 border-2 border-green-800 tracking-wider":
                    true,
                  "bg-green-800 text-white": activeWallet === WalletType.USER,
                  "bg-transparent": activeWallet !== WalletType.USER,
                })}
                onClick={() => setActiveWallet(WalletType.USER)}
              >
                Wallet
              </button>
              <button
                className={classNames({
                  "p-2 px-4 rounded font-bold uppercase text-xl pt-2.5 border-2 border-green-800 tracking-wider":
                    true,
                  "bg-green-800 text-white":
                    activeWallet === WalletType.STAKING,
                  "bg-transparent": activeWallet !== WalletType.STAKING,
                })}
                onClick={() => setActiveWallet(WalletType.STAKING)}
              >
                Staked
              </button>
            </div>
            <WalletMultiButton />
          </div>
          <NftListWrapper nfts={selectedNfts} />
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
