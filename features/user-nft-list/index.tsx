import { Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import LoadingNftCard from "features/nft-card/loading-nft-card";
import { useCallback, useEffect, useState } from "react";
import NftList from "../nft-list";

const UserNftList = () => {
  const [userNfts, setUserNfts] = useState<Nft[] | null>(null);
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const fetchUserNfts = useCallback(async () => {
    if (userNfts) return;

    try {
      const metaplex = Metaplex.make(connection);
      const nfts = await metaplex
        .nfts()
        .findAllByOwner(publicKey?.toString())
        .run();
      // const nfts = await metaplex
      //   .nfts()
      //   .findAllByCreator("7tiX1neqKjQ3mxYHjLZMw3ydC9cAUpeyAsRq2va5vizG")
      //   .run();
      setUserNfts(nfts);
    } catch (error) {
      console.error(error);
    }
  }, [connection, publicKey, userNfts]);

  useEffect(() => {
    if (!publicKey) return;
    fetchUserNfts();
  }, [fetchUserNfts, publicKey]);

  if (!publicKey) return <div>Connect wallet</div>;

  if (!userNfts)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8 mt-4">
        <LoadingNftCard />
        <LoadingNftCard />
        <LoadingNftCard />
      </div>
    );

  return (
    <div>
      <NftList nfts={userNfts} />
    </div>
  );
};

export default UserNftList;
