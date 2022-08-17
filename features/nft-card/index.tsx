import { Metadata, Nft } from "@metaplex-foundation/js";
import axios from "axios";
import classNames from "classnames";
import bg from "public/images/single-item-bg.png";
import { ReactNode, useEffect, useState } from "react";
import AttributesList from "features/nft-card/attributes-list";
import LoadingNftCard from "features/nft-card/loading-nft-card";

const NftCard = ({
  nft,
  children,
}: {
  nft: any;
  children: ReactNode | null;
}) => {
  const {
    holderWalletAddress,
    image,
    mintAddress,
    name,
    ownerWalletAddress,
    timestamp,
  } = nft;

  return (
    <div
      key={String(nft.address)}
      className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative shadow-deep hover:shadow-deep-float hover:scale-[1.03] duration-500"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={250}
        width={250}
        src={image}
        alt="raffle item"
        className={classNames({
          "w-full object-cover lg:max-h-[280px] mb-1 bg-gray-400": true,
        })}
      />
      <div className="text-2xl font-medium mb-2">{name}</div>
      {/* <AttributesList metaData={metaData} /> */}
      <div className="py-1">{children}</div>
    </div>
  );
};

export default NftCard;
