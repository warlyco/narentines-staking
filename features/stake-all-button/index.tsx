import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useIsLoading } from "hooks/is-loading";
import stakeNftsNonCustodial from "utils/stake-nfts-non-custodial";

type Props = {
  nfts: any[];
  removeFromDispayedNfts: (nft: any[]) => void;
};

const StakeAllButton = ({ nfts, removeFromDispayedNfts }: Props) => {
  const { isLoading, setIsLoading } = useIsLoading();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const stakeAllNfts = () => {
    if (!publicKey || !signTransaction) return;

    stakeNftsNonCustodial({
      nfts,
      publicKey,
      signTransaction,
      connection,
      setIsLoading,
      removeFromDispayedNfts,
    });
  };
  return (
    <button
      onClick={stakeAllNfts}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase"
    >
      Stake All
    </button>
  );
};

export default StakeAllButton;
