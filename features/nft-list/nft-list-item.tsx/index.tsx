import { Metadata, Nft } from "@metaplex-foundation/js";
import classNames from "classnames";

import NftCard from "features/nft-card";
import ClaimButton from "features/nft-card/claim-button";
import StakeUnstakeButtons from "features/nft-card/stake-unstake-buttons";
import { useCallback, useEffect, useState } from "react";
import { WalletTypes } from "types";
import dayjs from "dayjs";
import { PRIMARY_REWARD_AMOUNT_PER_DAY } from "constants/constants";

const MS_PER_DAY = 86400000;

type Props = {
  activeWallet: WalletTypes;
  nft: any;
  fetchNfts: () => Promise<void>;
};

const NftListItem = ({ nft, activeWallet, fetchNfts }: Props) => {
  const [primaryRewardAmount, setPrimaryRewardAmount] = useState(0);

  const calculatePrimaryReward = useCallback(() => {
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
    const rewardAmount = timeSinceStakingInDays * PRIMARY_REWARD_AMOUNT_PER_DAY;
    setPrimaryRewardAmount(rewardAmount);
  }, [nft]);

  useEffect(() => {
    if (!nft) return;
    calculatePrimaryReward();
  }, [calculatePrimaryReward, nft]);

  return (
    <div>
      <NftCard nft={nft}>
        {activeWallet === WalletTypes.STAKING && (
          <>
            <div className="flex text-sm">
              <div>Staked:&nbsp;</div>
              <div>{dayjs(nft?.timestamp).format("MM/DD/YYYY @ h:mm A")}</div>
            </div>
            <div className="flex text-sm mb-3">
              <div>Est. reward amount:&nbsp;</div>
              <div>
                {primaryRewardAmount.toFixed(2) === "0.00"
                  ? 0
                  : primaryRewardAmount.toFixed(2)}{" "}
                $GOODS
              </div>
            </div>
          </>
        )}
        <div className="flex space-x-2">
          <div
            className={classNames({
              flex: true,
              "flex-grow": activeWallet === WalletTypes.USER,
              "w-1/2": activeWallet === WalletTypes.STAKING,
            })}
          >
            <StakeUnstakeButtons
              nft={nft}
              activeWallet={activeWallet}
              fetchNfts={fetchNfts}
            />
          </div>
          {activeWallet === WalletTypes.STAKING && (
            <div className="flex flex-grow">
              <ClaimButton
                primaryRewardAmount={Number(primaryRewardAmount.toFixed(2))}
                mintAddress={nft?.mintAddress}
                fetchNfts={fetchNfts}
              />
            </div>
          )}
        </div>
      </NftCard>
    </div>
  );
};

export default NftListItem;
