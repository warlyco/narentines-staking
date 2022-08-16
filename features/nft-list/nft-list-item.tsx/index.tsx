import { Metadata, Nft } from "@metaplex-foundation/js";

import NftCard from "features/nft-card";
import StakeUnstakeButtons from "features/nft-card/stake-unstake-buttons";
import { useCallback } from "react";
import { WalletTypes } from "types";

type Props = {
  activeWallet: WalletTypes;
  nft: Metadata;
};

const NftListItem = ({ nft, activeWallet }: Props) => {
  return (
    <NftCard nft={nft}>
      <StakeUnstakeButtons nft={nft} activeWallet={activeWallet} />
    </NftCard>
  );
};

export default NftListItem;
