import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import { CREATOR_ADDRESS } from "constants/constants";
import ClientOnly from "features/client-only";
import NftListWrapper from "features/user-nft-list";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";
import { useLazyQuery } from "@apollo/client";
import { FETCH_NFTS_BY_MINT_ADDRESSES } from "graphql/queries/fetch-nfts-by-mint-addresses";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import StakeAllButton from "features/stake-all-button";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import UnstakeAllButton from "features/unstake-all-button";
import ClaimAllButton from "features/claim-all-button";

const Home: NextPage = () => {
  const [activeWallet, setActiveWallet] = useState<WalletTypes>(
    WalletTypes.USER
  );
  const [mergedNfts, setMergedNfts] = useState<any[] | null>(null);
  const [nftMetasFromMetaplex, setNftMetasFromMetaplex] = useState<
    Metadata[] | null
  >(null);
  const [addressesToFetchFromDb, setAddressesToFetchFromDb] = useState<
    string[]
  >([]);
  const [nftsToDisplay, setNftsToDisplay] = useState<Metadata[] | null>(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);
  const [shouldDisplayNfts, setShouldDisplayNfts] = useState<boolean>(true);

  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { view } = router.query;

  const [
    fetchNftsFromDb,
    {
      loading: isLoadingDbNfts,
      error: fetchFromDbError,
      data: nftsFromDb,
      refetch,
    },
  ] = useLazyQuery(FETCH_NFTS_BY_MINT_ADDRESSES, {
    variables: {
      mintAddresses: addressesToFetchFromDb,
    },
  });

  const updateNftInDb = useCallback(async () => {
    if (!nftsFromDb?.nfts?.length || !nftMetasFromMetaplex?.length) return;
    let ownerMintAddresses = [];

    let didUpdateNft = false;
    nftMetasFromMetaplex?.forEach((nft) => {
      const nftFromDb = nftsFromDb.nfts.find(
        (nftFromDb: any) => nftFromDb.mintAddress === nft.mintAddress.toString()
      );
      // @ts-ignore
      if (nft.isFrozen !== nftFromDb.isFrozen) {
        didUpdateNft = true;
        axios.post("/api/update-nft-frozen-state", {
          mintAddress: nftFromDb.mintAddress,
          // @ts-ignore
          isFrozen: nft.isFrozen,
        });
      }
      if (didUpdateNft) {
        refetch();
      }
    });

    for (const nft of nftsFromDb.nfts) {
      if (nft.ownerWalletAddress !== publicKey?.toString()) {
        ownerMintAddresses.push(nft.mintAddress);
      }
    }
    if (ownerMintAddresses.length) {
      axios.post("/api/update-nfts-owner", {
        mintAddresses: ownerMintAddresses,
        walletAddress: publicKey?.toString(),
      });
    }
  }, [nftMetasFromMetaplex, nftsFromDb?.nfts, publicKey, refetch]);

  useEffect(() => {
    console.log(nftsFromDb);
    if (!nftsFromDb?.nfts?.length) return;
    updateNftInDb();
  }, [nftsFromDb, updateNftInDb]);

  const fetchNftsFromMetaplex = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoadingNfts(true);
      const metaplex = Metaplex.make(connection);
      const nftMetasFromMetaplex = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey })
        .run();

      const collection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: any }) =>
          creators?.[0]?.address?.toString() === CREATOR_ADDRESS
      );

      let userNftsInCollectionMintAddresses = [];

      const metasWithFrozenState = await Promise.all(
        // @ts-ignore
        collection.map(async (metadata: Metadata) => {
          // const nft = await metaplex.nfts().load({ metadata }).run();
          // console.log(nft.mint.mintAuthorityAddress?.toString());c
          console.log(metadata);
          const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            // @ts-ignore
            publicKey,
            metadata.mintAddress,
            publicKey,
            false,
            "confirmed",
            {},
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          return { ...metadata, isFrozen: tokenAccount.isFrozen };
        })
      );
      console.log(metasWithFrozenState);
      setNftMetasFromMetaplex(metasWithFrozenState);

      for (let nft of collection) {
        // @ts-ignore
        const mintAddress = nft.mintAddress.toString();
        userNftsInCollectionMintAddresses.push(mintAddress);
      }
      console.log(userNftsInCollectionMintAddresses);

      setAddressesToFetchFromDb(userNftsInCollectionMintAddresses);
      await fetchNftsFromDb();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [connection, fetchNftsFromDb, publicKey]);

  const fetchNfts = useCallback(async () => {
    fetchNftsFromMetaplex();
  }, [fetchNftsFromMetaplex]);

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
    <div className="h-full w-full flex -mt-8">
      <div className="max-w-5xl p-4 text-2xl w-full">
        <ClientOnly>
          <div className="flex pb-4 justify-between items-center flex-wrap">
            <div className="space-x-2 py-4">
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
            <div className="items-center space-x-2 -mt-[1px] flex py-4">
              {activeWallet === WalletTypes.USER &&
                shouldDisplayNfts &&
                !!nftsFromDb?.nfts.filter((nft: any) => !nft.isFrozen)
                  ?.length && (
                  <StakeAllButton
                    nfts={
                      shouldDisplayNfts
                        ? nftsFromDb?.nfts.filter((nft: any) => !nft.isFrozen)
                        : []
                    }
                    removeFromDispayedNfts={() => setShouldDisplayNfts(false)}
                  />
                )}
              {activeWallet === WalletTypes.STAKING &&
                shouldDisplayNfts &&
                !!nftsFromDb?.nfts.filter((nft: any) => nft.isFrozen) && (
                  <>
                    <UnstakeAllButton
                      nfts={
                        shouldDisplayNfts
                          ? nftsFromDb?.nfts.filter((nft: any) => nft.isFrozen)
                          : []
                      }
                      removeFromDispayedNfts={() => setShouldDisplayNfts(false)}
                    />
                    <ClaimAllButton
                      refetch={refetch}
                      walletAddress={publicKey?.toString()}
                      nfts={
                        shouldDisplayNfts
                          ? nftsFromDb?.nfts.filter((nft: any) => nft.isFrozen)
                          : []
                      }
                    />
                  </>
                )}
              <div className="hidden md:flex">
                <WalletMultiButton />
              </div>
            </div>
          </div>
          <NftListWrapper
            fetchNfts={fetchNfts}
            activeWallet={activeWallet}
            nfts={
              shouldDisplayNfts
                ? activeWallet === WalletTypes.USER
                  ? nftsFromDb?.nfts.filter((nft: any) => !nft.isFrozen)
                  : nftsFromDb?.nfts.filter((nft: any) => nft.isFrozen)
                : []
            }
            isLoadingNfts={isLoadingNfts}
          />
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
