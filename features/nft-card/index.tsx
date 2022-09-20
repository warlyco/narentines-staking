import { Metadata, Nft } from "@metaplex-foundation/js";
import axios from "axios";
import classNames from "classnames";
import bg from "public/images/single-item-bg.png";
import { ReactNode, useEffect, useState } from "react";

const NftCard = ({
  nft,
  children,
}: {
  nft: any;
  children: ReactNode | null;
}) => {
  const { image, mintAddress, name, ownerWalletAddress } = nft;

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
        alt="Nft image"
        className={classNames({
          "w-full object-cover lg:max-h-[280px] mb-1 bg-gray-400": true,
        })}
      />
      <div>
        <div className="text-2xl font-medium mb-3">{name}</div>
        {/* <AttributesList metaData={metaData} /> */}
        {children}
      </div>
    </div>
  );
};

export default NftCard;
