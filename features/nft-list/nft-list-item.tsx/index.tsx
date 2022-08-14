import { Nft } from "@metaplex-foundation/js";
import NftCard from "features/nft-card";
import StakeUnstakeButtons from "features/nft-card/stake-unstake-buttons";
import { useCallback } from "react";
import { WalletTypes } from "types";

type Props = {
  activeWallet: WalletTypes;
  nft: Nft;
};

const NftListItem = ({ nft, activeWallet }: Props) => {
  const stakeNft = useCallback(async () => {}, []);
  const unstakeNft = useCallback(async () => {}, []);

  return (
    <NftCard nft={nft}>
      <StakeUnstakeButtons
        activeWallet={activeWallet}
        stakeNft={stakeNft}
        unstakeNft={unstakeNft}
      />
    </NftCard>
  );
};

export default NftListItem;
