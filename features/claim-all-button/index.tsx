import axios from "axios";
import { useState } from "react";

type Props = {
  nfts: any[];
};

const ClaimAllButton = ({ nfts }: Props) => {
  const [payoutAmount, setPayoutAmount] = useState(0);

  const calulateRewards = async () => {
    console.log({ nfts });
    const mintAddresses = nfts.map((nft) => nft.mintAddress);
    const { data } = await axios.post("/api/calculate-rewards", {
      mintAddresses,
    });
    setPayoutAmount(data.payoutAmount);
  };

  const claimAllRewards = () => {};
  // calulateRewards();

  return (
    <button
      onClick={claimAllRewards}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase"
    >
      Claim All
    </button>
  );
};

export default ClaimAllButton;
