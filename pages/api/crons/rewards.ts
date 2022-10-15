import { PRIMARY_REWARD_AMOUNT_PER_DAY } from "constants/constants";
import dayjs from "dayjs";
import request from "graphql-request";
import { UPDATE_NFT_UNCLAIMED_REWARDS_INFO } from "graphql/mutations/update-nft-unclaimed-rewards-info";
import { FETCH_FROZEN_NFTS } from "graphql/queries/fetch-frozen-nfts";
import { NextApiRequest, NextApiResponse } from "next";
import { add, multiply } from "utils/maths";

const calculateStakedRewards = async (res: NextApiResponse) => {
  try {
    const { nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: FETCH_FROZEN_NFTS,
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    const updateReqs = nfts.map((nft: any) => {
      console.log(nft);
      // DO MATHS
      const {
        rewardsLastCalculatedTimestamp,
        unclaimedRewardsAmount,
        mintAddress,
      } = nft;

      let newUnclaimedRewardsAmount = 0;
      const hourlyRewardRate = PRIMARY_REWARD_AMOUNT_PER_DAY / 24;

      if (!rewardsLastCalculatedTimestamp) {
        newUnclaimedRewardsAmount = multiply(hourlyRewardRate, 0.25);
        console.log(
          "No rewardsLastCalculatedTimestamp",
          newUnclaimedRewardsAmount
        );
      } else {
        // console.log("rewardsLastCalculatedTimestamp");
        const date1 = dayjs();
        const date2 = dayjs(rewardsLastCalculatedTimestamp);
        const diff = date1.diff(date2, "hour", true);
        const additionalRewards = multiply(hourlyRewardRate, diff);
        // console.log({ hourlyRewardRate, diff, additionalRewards });
        newUnclaimedRewardsAmount = add(
          unclaimedRewardsAmount,
          additionalRewards
        );
      }

      return request({
        url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
        document: UPDATE_NFT_UNCLAIMED_REWARDS_INFO,
        variables: {
          mintAddress: mintAddress,
          unclaimedRewardsAmount: newUnclaimedRewardsAmount,
          rewardsLastCalculatedTimestamp: new Date().toISOString(),
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });
    });
    const responses = await Promise.all(updateReqs);
    console.log({ responses });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;

      if (authorization === `Bearer ${process.env.API_SECRET_KEY}`) {
        calculateStakedRewards(res);
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
