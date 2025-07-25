import { Metadata, Nft } from "@metaplex-foundation/js";
import classNames from "classnames";

import NftCard from "features/nft-card";
import StakeUnstakeButtons from "features/nft-card/stake-unstake-buttons";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";
import dayjs from "dayjs";
import {
  GOODS_TOKEN_MINT_ADDRESS,
  MS_PER_DAY,
  PRIMARY_REWARD_AMOUNT_PER_DAY,
  Profession,
  ProfessionIds,
  ProfessionNames,
} from "constants/constants";
import { useQuery } from "@apollo/client";
import { FETCH_PROFESSIONS } from "graphql/queries/fetch-professions";
import { useIsLoading } from "hooks/is-loading";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import toast from "react-hot-toast";
import claimPrimaryRewards from "utils/claim-primary-rewards";

type Props = {
  removeFromDispayedNfts: (nft: Nft[]) => void;
  activeWallet: WalletTypes;
  nft: any;
  fetchNfts: () => Promise<void>;
};

const options = Object.keys(ProfessionNames).map((profession: string) => ({
  // @ts-ignore
  value: ProfessionIds[profession],
  // @ts-ignore
  text: ProfessionNames[profession],
}));

const NftListItem = ({
  nft,
  activeWallet,
  fetchNfts,
  removeFromDispayedNfts,
}: Props) => {
  const [primaryRewardAmount, setPrimaryRewardAmount] = useState(0);
  const [secondaryRewardAmount, setSecondaryRewardAmount] = useState(0);
  const [secondaryRewardLabel, setSecondaryRewardLabel] = useState("Secondary");
  const [selectedProfessionId, setSelectedProfessionId] = useState(
    ProfessionIds.BANKER
  );
  const { loading, error, data: professionsData } = useQuery(FETCH_PROFESSIONS);
  const { setIsLoading } = useIsLoading();
  const { publicKey } = useWallet();

  const handleClaimPrimaryRewards = () => {
    if (!publicKey) {
      throw new Error("Wallet not connected!");
    }

    return claimPrimaryRewards({
      primaryRewardAmount,
      setIsLoading,
      nfts: [nft],
      publicKey,
      setPrimaryRewardAmount,
    });
  };

  const getStakingTime = useCallback(() => {
    const { timestamp, lastClaimTimestamp } = nft;
    const now = dayjs();
    let stakingTime;
    if (!lastClaimTimestamp) {
      stakingTime = dayjs(timestamp);
    } else {
      stakingTime = dayjs(lastClaimTimestamp);
    }
    const timeSinceStakingInMs = now.diff(stakingTime);
    const timeSinceStakingInDays = timeSinceStakingInMs / MS_PER_DAY;
    return { timeSinceStakingInMs, timeSinceStakingInDays };
  }, [nft]);

  const handleUpdateSelectedProfession = (e: any) => {
    console.log(e.target);
    setSelectedProfessionId(e.target.value);
  };

  const calculateSecondaryReward = useCallback(() => {
    const { professions } = professionsData;
    if (nft.profession.id === ProfessionIds.BANKER) {
      setSecondaryRewardAmount(0);
      return;
    }
    const profession = professions.find(
      (profession: Profession) => profession.id === nft.profession.id
    );
    const { timeSinceStakingInDays } = getStakingTime();
    const rewardAmount = timeSinceStakingInDays * profession?.dailyRewardRate;
    setSecondaryRewardAmount(Math.floor(rewardAmount));
  }, [professionsData, nft, getStakingTime]);

  const updateSecondaryRewardLabel = useCallback(() => {
    const { professions } = professionsData;
    const profession = professions.find(
      (profession: Profession) => profession.id === nft.profession.id
    );
    setSecondaryRewardLabel(profession?.resource?.name);
  }, [professionsData, nft]);

  useEffect(() => {
    if (!nft) return;

    setPrimaryRewardAmount(nft.unclaimedRewardsAmount);
    // calculateSecondaryReward();
    // updateSecondaryRewardLabel();
  }, [
    professionsData,
    nft,
    calculateSecondaryReward,
    updateSecondaryRewardLabel,
  ]);

  return (
    <div>
      <NftCard nft={nft}>
        {activeWallet === WalletTypes.STAKING && (
          <>
            {/* {nft?.profession?.name && (
              <div className="absolute top-2 right-2 bg-amber-200 text-green-800 p-2 rounded">
                {nft?.profession?.name}
              </div>
            )} */}
            <div className="flex text-sm mb-2">
              <div>Staked:&nbsp;</div>
              <div>
                {dayjs(
                  nft?.lastClaimTimestamp
                    ? nft?.lastClaimTimestamp
                    : nft?.timestamp
                ).format("MM/DD/YYYY @ h:mm A")}
              </div>
            </div>
            <div className="flex flex-col text-sm mb-3">
              <div className="font-bold text-sm tracking-wide uppercase">
                Rewards
              </div>
              <div>
                <span className="font-bold mr-2">$GOODS:</span>
                {Number(primaryRewardAmount.toFixed(2)) === 0
                  ? 0
                  : Number(primaryRewardAmount.toFixed(2))}{" "}
                ({PRIMARY_REWARD_AMOUNT_PER_DAY}/day)
                {/* {nft.profession.id === ProfessionIds.BANKER
                  ? PRIMARY_REWARD_AMOUNT_PER_DAY +
                    nft?.profession?.dailyRewardRate
                  : PRIMARY_REWARD_AMOUNT_PER_DAY}
                /day) */}
              </div>
              {/* {nft.profession.id === ProfessionIds.BANKER ? (
                <div>&nbsp;</div>
              ) : (
                <div>
                  <span className="font-bold mr-2">
                    {secondaryRewardLabel}:
                  </span>
                  {Number(secondaryRewardAmount.toFixed(2)) === 0
                    ? 0
                    : Number(secondaryRewardAmount)}{" "}
                  ({nft?.profession?.dailyRewardRate}/day)
                </div>
              )} */}
            </div>
          </>
        )}
        {/* {activeWallet === WalletTypes.USER && (
          <label className="flex flex-col my-4">
            <span className="font-bold uppercase text-sm tracking-wider">
              Choose Profession
            </span>
            <select
              className="bg-amber-200 text-green-800 p-1 px-2 rounded font-bold border border-green-800 mb-4"
              value={selectedProfessionId}
              onChange={handleUpdateSelectedProfession}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
          </label>
        )} */}
        <div className="flex space-x-2">
          <div
            className={classNames({
              flex: true,
              "flex-grow": activeWallet === WalletTypes.USER,
              "w-1/2": activeWallet === WalletTypes.STAKING,
            })}
          >
            <StakeUnstakeButtons
              claimReward={handleClaimPrimaryRewards}
              removeFromDispayedNfts={removeFromDispayedNfts}
              nft={nft}
              activeWallet={activeWallet}
              professionId={selectedProfessionId}
            />
          </div>
          {activeWallet === WalletTypes.STAKING && (
            <div className="flex flex-grow">
              <button
                className={classNames({
                  "flex-grow border-2 uppercase p-2 pt-3 rounded font-medium":
                    true,
                  "border-green-800 bg-green-800 text-amber-200 hover:bg-amber-200 hover:text-green-800 ":
                    primaryRewardAmount !== 0,
                  "border-slate-500 bg-slate-500 text-amber-200 cursor-not-allowed":
                    primaryRewardAmount === 0,
                })}
                onClick={handleClaimPrimaryRewards}
                disabled={primaryRewardAmount === 0}
              >
                Claim
              </button>
            </div>
          )}
        </div>
      </NftCard>
    </div>
  );
};

export default NftListItem;
