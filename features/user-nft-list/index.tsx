import { Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import LoadingNftCard from "features/nft-card/loading-nft-card";
import { useCallback, useEffect, useState } from "react";
import NftList from "../nft-list";

const NftListWrapper = ({ nfts }: { nfts: Nft[] | null }) => {
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
      <NftList nfts={nfts} />
    </div>
  );
};

export default NftListWrapper;
