import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import {
  MINIMUM_PAYOUT_AMOUNT,
  STAKING_COST_IN_SOL,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import showToast from "features/toasts/toast";
import { useIsLoading } from "hooks/is-loading";
import { chunk } from "lodash";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import claimPrimaryRewards from "utils/claim-primary-rewards";

type Props = {
  nfts: any[];
  removeFromDispayedNfts: (nft?: any[]) => void;
};

const UnstakeAllButton = ({ nfts, removeFromDispayedNfts }: Props) => {
  const { isLoading, setIsLoading } = useIsLoading();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);

  const calulateRewards = useCallback(() => {
    if (!nfts?.length) {
      setPayoutAmount(0);
      setHasUnclaimedRewards(false);
      return;
    }
    let totalPayoutAmount = 0;
    for (const nft of nfts) {
      totalPayoutAmount += nft.unclaimedRewardsAmount || 0;
    }
    setPayoutAmount(Number(totalPayoutAmount));
    setHasUnclaimedRewards(
      Number(totalPayoutAmount.toFixed(2)) > MINIMUM_PAYOUT_AMOUNT
    );
    console.log(
      totalPayoutAmount,
      Number(totalPayoutAmount.toFixed(2)),
      hasUnclaimedRewards
    );
  }, [hasUnclaimedRewards, nfts]);

  const unstakeAllNfts = async () => {
    if (!publicKey || !signTransaction) return;
    calulateRewards();

    setIsLoading(true, "Connecting to Solana...");
    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    const amountOfSol = Number(STAKING_COST_IN_SOL) || 0.01;
    const solInLamports = amountOfSol * LAMPORTS_PER_SOL;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(STAKING_WALLET_ADDRESS),
        lamports: solInLamports,
      })
    );

    transaction.feePayer = publicKey;
    let signedTransaction;
    try {
      signedTransaction = await signTransaction(transaction);
    } catch (error) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true, "Sending transaction to Solana...");
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          preflightCommitment: "confirmed",
        }
      );
      await connection.confirmTransaction(
        {
          signature,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          blockhash: latestBlockhash.blockhash,
        },
        "confirmed"
      );
    } catch (error) {
      showToast({
        primaryMessage: "There was an problem",
        secondaryMessage: "Please try again",
      });
      return;
    }

    let claimWasSuccessful;
    if (hasUnclaimedRewards) {
      setIsLoading(true, `Claiming $${payoutAmount} GOODS`);
      claimWasSuccessful = await claimPrimaryRewards({
        nfts,
        primaryRewardAmount: payoutAmount,
        setIsLoading,
        publicKey,
        setPrimaryRewardAmount: setPayoutAmount,
        isOnlyAction: false,
      });
    }

    if (hasUnclaimedRewards && !claimWasSuccessful) {
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl">
            Could not claim reward, try again.
          </div>
        </div>
      );
      throw new Error("Claiming rewards failed");
    }

    setIsLoading(true, "Unstaking...");

    const tokenMintAddresses = nfts.map((nft) => nft.mintAddress);
    const splitTokenMintAddresses = chunk(tokenMintAddresses, 8);
    const thawReqs = [];
    const resetReqs = [];
    for (const tokenMintAddresses of splitTokenMintAddresses) {
      const thawReq = axios.post("/api/thaw-token-accounts", {
        tokenMintAddresses,
        walletAddress: publicKey.toString(),
      });
      const resetReq = axios.post("/api/reset-nfts-claim-time", {
        mintAddresses: tokenMintAddresses,
      });
      thawReqs.push(thawReq);
      resetReqs.push(resetReq);
    }
    try {
      const responses = await Promise.all([...thawReqs, ...resetReqs]);

      showToast({
        primaryMessage: "Unstaked!",
      });
      removeFromDispayedNfts(tokenMintAddresses);
      setIsLoading(false);
    } catch (error) {
      showToast({
        primaryMessage: "There was a problem",
        secondaryMessage: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calulateRewards();
  }, [calulateRewards, nfts, payoutAmount]);

  return (
    <button
      onClick={unstakeAllNfts}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase px-3"
    >
      Unstake All
    </button>
  );
};

export default UnstakeAllButton;
