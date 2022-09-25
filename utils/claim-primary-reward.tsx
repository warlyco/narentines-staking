import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { GOODS_TOKEN_MINT_ADDRESS } from "constants/constants";
import toast from "react-hot-toast";

type Args = {
  nft: any;
  primaryRewardAmount: number;
  setIsLoading: (isLoading: boolean, message?: string) => void;
  publicKey: PublicKey;
  setPrimaryRewardAmount: (amount: number) => void;
};

const claimPrimaryReward: ({
  nft,
  primaryRewardAmount,
  setIsLoading,
  publicKey,
  setPrimaryRewardAmount,
}: Args) => Promise<boolean | undefined> = async ({
  primaryRewardAmount,
  setIsLoading,
  nft,
  publicKey,
  setPrimaryRewardAmount,
}) => {
  if (primaryRewardAmount === 0) return;
  return new Promise(async (resolve, reject) => {
    setIsLoading(true, `Claiming ${primaryRewardAmount.toFixed(2)} $GOODS`);
    console.log({ nft });
    const { data, status } = await axios.post("/api/init-reward-claim", {
      mintAddresses: [nft.mintAddress],
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
      return reject(false);
    }

    toast.custom(
      <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
        <div className="font-bold text-3xl mb-2">
          Claimed {primaryRewardAmount.toFixed(2)} $GOODS
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
    setPrimaryRewardAmount(0);
    return resolve(true);
  });
};

export default claimPrimaryReward;
