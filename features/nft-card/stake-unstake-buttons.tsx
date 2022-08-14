import Image from "next/image";
import { useState } from "react";
import { WalletTypes } from "types";

type Props = {
  stakeNft: () => void;
  unstakeNft: () => void;
  activeWallet: WalletTypes;
};

enum Professions {
  FISHING = "FISHING",
  MINING = "MINING",
  FARMING = "FARMING",
}

const StakeUnstakeButtons = ({ activeWallet, stakeNft, unstakeNft }: Props) => {
  const [profession, setProfession] = useState<Professions | null>(null);

  const selectProfession = (profession: string) => {
    setProfession(profession as Professions);
  };

  return (
    <div className="flex w-full space-x-3">
      <button
        className="flex-grow border-2 border-green-800 uppercase bg-green-800 p-2 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800"
        onClick={activeWallet === WalletTypes.USER ? stakeNft : unstakeNft}
      >
        {activeWallet === WalletTypes.USER ? "Stake" : "Unstake"}
      </button>
    </div>
  );
};

export default StakeUnstakeButtons;
