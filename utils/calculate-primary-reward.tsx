import { MS_PER_DAY, PRIMARY_REWARD_AMOUNT_PER_DAY } from "constants/constants";
import dayjs from "dayjs";

const calculatePrimaryReward = (nft: any) => {
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

  return Number(
    (timeSinceStakingInDays * PRIMARY_REWARD_AMOUNT_PER_DAY).toFixed(1)
  );
};

export default calculatePrimaryReward;
