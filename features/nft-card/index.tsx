import { Nft } from "@metaplex-foundation/js";
import axios from "axios";
import classNames from "classnames";
import bg from "public/images/single-item-bg.png";
import { useEffect, useState } from "react";
import AttributesList from "features/nft-card/attributes-list";
import LoadingNftCard from "features/nft-card/loading-nft-card";

const NftCard = ({ nft }: { nft: Nft }) => {
  const [metaData, setMetaData] = useState<any>();

  const fetchMetaData = async (uri: string) => {
    const { data } = await axios.get(uri);
    setMetaData(data);
  };

  useEffect(() => {
    const { uri } = nft;
    if (!uri) return;

    fetchMetaData(uri);
  }, [nft]);

  if (!metaData) return <LoadingNftCard />;

  const { name, image } = metaData;

  return (
    <div
      key={String(nft.address)}
      className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative deep-shadow"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={250}
        width={250}
        src={image}
        alt="raffle item"
        className={classNames({
          "w-full object-cover lg:max-h-[280px] mb-2 bg-gray-400": true,
        })}
      />
      <div className="text-2xl font-bold py-1">{name}</div>
      {/* <AttributesList metaData={metaData} /> */}
    </div>
  );
};

export default NftCard;
