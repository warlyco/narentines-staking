import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { GOODS_TOKEN_MINT_ADDRESS } from "constants/constants";
import showToast from "features/toasts/toast";
import { useIsLoading } from "hooks/is-loading";
import toast from "react-hot-toast";

type Props = {
  mintAddress: string;
  primaryRewardAmount: number;
  fetchNfts: () => Promise<void>;
};

const ClaimButton = ({
  mintAddress,
  primaryRewardAmount,
  fetchNfts,
}: Props) => {
  const { setIsLoading } = useIsLoading();
  const { publicKey } = useWallet();

  const claimPrimaryReward = async () => {
    if (primaryRewardAmount === 0) return;

    setIsLoading(true, `Claiming ${primaryRewardAmount} $GOODS`);
    const { data, status } = await axios.post("/api/init-reward-claim", {
      mintAddress,
      amount: primaryRewardAmount,
      rewardTokenAddress: GOODS_TOKEN_MINT_ADDRESS,
      walletAddress: publicKey?.toString(),
    });
    setIsLoading(false);

    const { confirmation } = data;

    if (status !== 200) {
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl mb-2">
            There might have been a problem.
          </div>
          {confirmation && (
            <>
              <div>Chack the transaction on solscan:</div>
              <a
                href={`//solscan.io/tx/${confirmation}`}
                className="underline text-green-800"
              >
                {confirmation.slice(0, 4)}...{confirmation.slice(-4)}
              </a>
            </>
          )}
        </div>
      );
      return;
    }

    toast.custom(
      <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
        <div className="font-bold text-3xl mb-2">
          Claimed {primaryRewardAmount} $GOODS
        </div>
        <div>View tx:</div>
        <a
          href={`//solscan.io/tx/${confirmation}`}
          target="_blank"
          rel="noreferrer"
          className="underline text-green-800"
        >
          {confirmation.slice(0, 4)}...{confirmation.slice(-4)}
        </a>
      </div>
    );
    fetchNfts();
  };

  return (
    <button
      className={classNames({
        "flex-grow border-2 uppercase p-2 pt-3 rounded font-medium": true,
        "border-green-800 bg-green-800 text-amber-200 hover:bg-amber-200 hover:text-green-800 ":
          primaryRewardAmount !== 0,
        "border-slate-500 bg-slate-500 text-amber-200 cursor-not-allowed":
          primaryRewardAmount === 0,
      })}
      onClick={claimPrimaryReward}
      disabled={primaryRewardAmount === 0}
    >
      Claim
    </button>
  );
};

export default ClaimButton;
