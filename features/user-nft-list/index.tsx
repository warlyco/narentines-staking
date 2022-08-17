import { Metadata, Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CREATOR_ADDRESS } from "constants/constants";
import LoadingNftCard from "features/nft-card/loading-nft-card";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";
import NftList from "../nft-list";

type Props = {
  nfts: Metadata[] | null;
  isLoadingNfts: boolean;
  activeWallet: WalletTypes;
  fetchNfts: () => Promise<void>;
};

const NftListWrapper = ({
  nfts,
  isLoadingNfts,
  activeWallet,
  fetchNfts,
}: Props) => {
  if (!nfts)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8 mt-4">
        <LoadingNftCard />
        <LoadingNftCard />
        <LoadingNftCard />
      </div>
    );

  return (
    <div>
      <NftList
        fetchNfts={fetchNfts}
        nfts={nfts}
        isLoadingNfts={isLoadingNfts}
        activeWallet={activeWallet}
      />
    </div>
  );
};

export default NftListWrapper;
