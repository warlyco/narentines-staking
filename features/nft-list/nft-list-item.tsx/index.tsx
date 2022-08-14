import { Nft } from "@metaplex-foundation/js";
import NftCard from "features/nft-card";
import { useCallback } from "react";
import { WalletTypes } from "types";

type Props = {
  activeWallet: WalletTypes;
  nft: Nft;
};

const NftListItem = ({ nft, activeWallet }: Props) => {
  const stakeNft = useCallback(async () => {}, []);

  return (
    <NftCard nft={nft}>
      {activeWallet === WalletTypes.USER && (
        <button
          className="border-2 border-green-800 bg-green-800 p-2 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800"
          onClick={stakeNft}
        >
          Stake
        </button>
      )}
    </NftCard>
  );
};

export default NftListItem;
