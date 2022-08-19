import { Metadata, Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { CREATOR_ADDRESS, STAKING_WALLET_ADDRESS } from "constants/constants";
import ClientOnly from "features/client-only";
import NftListWrapper from "features/user-nft-list";
import UserNftList from "features/user-nft-list";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";
import { useLazyQuery } from "@apollo/client";
import { FETCH_NFTS_BY_HOLDER_AND_OWNER } from "graphql/queries/fetch-nfts-by-holder-and-owner";
import { jsonToBase64 } from "@toruslabs/openlogin-utils";
import { FETCH_NFTS_BY_MINT_ADDRESSES } from "graphql/queries/fetch-nfts-by-mint-addresses";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import showToast from "features/toasts/toast";

const Home: NextPage = () => {
  const [activeWallet, setActiveWallet] = useState<WalletTypes>(
    WalletTypes.USER
  );
  const [nftsFromMetaplex, setNftsFromMetaplex] = useState<Metadata[] | null>(
    null
  );
  const [addressesToFetch, setAddressesToFetch] = useState<string[]>([]);
  const [nftsToDisplay, setNftsToDisplay] = useState<Metadata[] | null>(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);

  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { view } = router.query;

  const [
    fetchStakedNfts,
    { loading: isLoadingStakedNfts, error, data: stakedNfts },
  ] = useLazyQuery(FETCH_NFTS_BY_HOLDER_AND_OWNER, {
    variables: {
      ownerWalletAddress: publicKey?.toString(),
      holderWalletAddress: STAKING_WALLET_ADDRESS,
    },
    fetchPolicy: "no-cache",
  });

  const [
    fetchNftsFromDb,
    { loading: isLoadingDbNfts, error: fetchFromDbError, data: nftsFromDb },
  ] = useLazyQuery(FETCH_NFTS_BY_MINT_ADDRESSES, {
    variables: {
      mintAddresses: addressesToFetch,
    },
  });

  const updateOwnerHolderInDb = useCallback(async () => {
    if (!nftsFromDb?.nfts?.length) return;
    let ownerMintAddresses = [];
    let holderMintAddresses = [];
    const activeWalletAddress =
      activeWallet === WalletTypes.USER
        ? publicKey?.toString()
        : STAKING_WALLET_ADDRESS;
    for (const nft of nftsFromDb.nfts) {
      if (nft.ownerWalletAddress !== publicKey?.toString()) {
        ownerMintAddresses.push(nft.mintAddress);
      }
      if (nft.holderWalletAddress !== activeWalletAddress) {
        holderMintAddresses.push(nft.mintAddress);
      }
    }
    if (ownerMintAddresses.length && activeWallet === WalletTypes.USER) {
      axios.post("/api/update-nfts-owner", {
        mintAddresses: ownerMintAddresses,
        walletAddress: publicKey?.toString(),
      });
    }
    if (holderMintAddresses.length) {
      axios.post("/api/update-nfts-holder", {
        mintAddresses: holderMintAddresses,
        walletAddress: publicKey?.toString(),
      });
    }
  }, [activeWallet, nftsFromDb?.nfts, publicKey]);

  useEffect(() => {
    if (!nftsFromDb?.nfts?.length) return;
    updateOwnerHolderInDb();
  }, [nftsFromDb, updateOwnerHolderInDb]);

  const fetchNftsFromMetaplex = useCallback(async () => {
    try {
      setIsLoadingNfts(true);
      const metaplex = Metaplex.make(connection);
      const nftsFromMetaplex = await metaplex
        .nfts()
        .findAllByOwner(publicKey?.toString())
        .run();
      setNftsFromMetaplex(nftsFromMetaplex);
      const collection = nftsFromMetaplex.filter(
        ({ creators }: { creators: any }) =>
          creators?.[0]?.address?.toString() === CREATOR_ADDRESS
      );

      let userNftsInCollectionMintAddresses = [];
      for (let nft of collection) {
        const mintAddress = nft.mintAddress.toString();
        userNftsInCollectionMintAddresses.push(mintAddress);
      }
      setAddressesToFetch(userNftsInCollectionMintAddresses);
      await fetchNftsFromDb();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [connection, fetchNftsFromDb, publicKey]);

  const fetchNfts = useCallback(async () => {
    if (activeWallet === WalletTypes.STAKING) {
      await fetchStakedNfts();

      return;
    } else {
      console.log("fetchNftsFromMetaplex");
      fetchNftsFromMetaplex();
    }
  }, [activeWallet, fetchNftsFromMetaplex, fetchStakedNfts]);

  useEffect(() => {
    if (!publicKey) return;

    switch (view) {
      case "staked":
        setActiveWallet(WalletTypes.STAKING);
        break;
      case "wallet":
      default:
        setActiveWallet(WalletTypes.USER);
    }
    fetchNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, activeWallet, router.query]);

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
              <Link
                href={{
                  pathname: "/",
                  query: { view: "wallet" },
                }}
              >
                <a
                  className={classNames({
                    "px-4 py-0.5 pt-1 rounded font-medium uppercase text-2xl border-2 border-green-800 tracking-wider":
                      true,
                    "bg-green-800 text-white":
                      activeWallet === WalletTypes.USER,
                    "bg-transparent": activeWallet !== WalletTypes.USER,
                  })}
                >
                  Wallet
                </a>
              </Link>
              <Link
                href={{
                  pathname: "/",
                  query: { view: "staked" },
                }}
              >
                <a
                  className={classNames({
                    "px-4 py-0.5 pt-1 rounded font-medium uppercase text-2xl border-2 border-green-800 tracking-wider":
                      true,
                    "bg-green-800 text-white":
                      activeWallet === WalletTypes.STAKING,
                    "bg-transparent": activeWallet !== WalletTypes.STAKING,
                  })}
                >
                  Staked
                </a>
              </Link>
            </div>
            <div className="flex items-center space-x-2 -mt-[1px]">
              {/* {activeWallet === WalletTypes.USER &&
                !!nftsFromMetaplex?.length && (
                  <button className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase">
                    Stake All
                  </button>
                )} */}
              <WalletMultiButton />
            </div>
          </div>
          <NftListWrapper
            fetchNfts={fetchNfts}
            activeWallet={activeWallet}
            nfts={
              activeWallet === WalletTypes.USER
                ? nftsFromDb?.nfts
                : stakedNfts?.nfts
            }
            isLoadingNfts={isLoadingNfts || isLoadingStakedNfts}
          />
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
