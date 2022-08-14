import { WalletTypes } from "types";

type Props = {
  stakeNft: () => void;
  unstakeNft: () => void;
  activeWallet: WalletTypes;
};

const StakeUnstakeButtons = ({ activeWallet, stakeNft, unstakeNft }: Props) => {
  if (activeWallet === WalletTypes.USER) {
    return (
      <button
        className="border-2 border-green-800 uppercase bg-green-800 p-2 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800"
        onClick={stakeNft}
      >
        Stake
      </button>
    );
  }
  if (activeWallet === WalletTypes.STAKING) {
    return (
      <button
        className="border-2 border-green-800 uppercase bg-green-800 p-2 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800"
        onClick={stakeNft}
      >
        Unstake
      </button>
    );
  }
  return <></>;
};

export default StakeUnstakeButtons;
