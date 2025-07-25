import { Metadata } from "@metaplex-foundation/js";

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
  ProfessionIds,
  STAKING_COST_IN_SOL,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import showToast from "features/toasts/toast";
import { useIsLoading } from "hooks/is-loading";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { WalletTypes } from "types";
import claimPrimaryRewards from "utils/claim-primary-rewards";
import stakeNftsNonCustodial from "utils/stake-nfts-non-custodial";

type Props = {
  activeWallet: WalletTypes;
  nft: Metadata;
  professionId: ProfessionIds;
  claimReward: () => Promise<boolean | undefined>;
  removeFromDispayedNfts: (nft: any[]) => void;
};

const StakeUnstakeButtons = ({
  activeWallet,
  nft,
  professionId,
  removeFromDispayedNfts,
  claimReward,
}: Props) => {
  const { setIsLoading, setLoadingMessage } = useIsLoading();
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);
  const [primaryRewardAmount, setPrimaryRewardAmount] = useState(0);

  const { publicKey, signTransaction, sendTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();

  const stakeNft = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      console.log("error", "Wallet not connected!");
      return;
    }
    stakeNftsNonCustodial({
      signAllTransactions,
      removeFromDispayedNfts,
      publicKey,
      signTransaction,
      nfts: [nft],
      connection,
      setIsLoading,
      professionId,
    });
  };

  const unstakeNft = async () => {
    // @ts-ignore
    setPrimaryRewardAmount(nft.unclaimedRewardsAmount);
    setHasUnclaimedRewards(
      Number(primaryRewardAmount.toFixed(2)) > MINIMUM_PAYOUT_AMOUNT
    );

    if (!publicKey || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }
    if (!STAKING_WALLET_ADDRESS) {
      throw new Error("STAKING_WALLET_ADDRESS is not defined");
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    const amountOfSol = Number(STAKING_COST_IN_SOL) || 0.01;
    const solInLamports = amountOfSol * LAMPORTS_PER_SOL;
    setIsLoading(true, "Connecting to Solana...");
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
      setIsLoading(true, `Claiming ${primaryRewardAmount} GOODS`);
      claimWasSuccessful = await claimPrimaryRewards({
        nfts: [nft],
        primaryRewardAmount,
        setIsLoading,
        publicKey,
        setPrimaryRewardAmount,
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

    const tokenMintAddress = nft.mintAddress;

    try {
      setIsLoading(true, "Unstaking...");
      const { data, status } = await axios.post("/api/thaw-token-accounts", {
        tokenMintAddresses: [tokenMintAddress],
        walletAddress: publicKey.toString(),
      });
      await axios.post("/api/reset-nfts-claim-time", {
        mintAddresses: [tokenMintAddress],
      });
      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
          <div className="font-bold text-3xl">Unstaked!</div>
        </div>
      );

      removeFromDispayedNfts([tokenMintAddress]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!nft) return;
    // @ts-ignore
    setPrimaryRewardAmount(nft.unclaimedRewardsAmount);
    const hasUnclaimedRewards = primaryRewardAmount
      ? Number(primaryRewardAmount?.toFixed(2)) > MINIMUM_PAYOUT_AMOUNT
      : false;
    setHasUnclaimedRewards(hasUnclaimedRewards);
  }, [primaryRewardAmount, nft]);

  return (
    <>
      <button
        className="flex-grow border-2 border-green-800 uppercase bg-green-800 p-2 pt-3 rounded text-amber-200 hover:bg-amber-200 hover:text-green-800 font-medium"
        onClick={activeWallet === WalletTypes.USER ? stakeNft : unstakeNft}
      >
        {activeWallet === WalletTypes.USER ? "Stake" : "Unstake"}
      </button>
    </>
  );
};

export default StakeUnstakeButtons;
