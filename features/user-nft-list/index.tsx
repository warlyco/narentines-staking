import { Metaplex, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { COLLECTION_SYMBOL, CREATOR_ADDRESS } from "constants/constants";
import NftListItem from "features/nft-list/nft-list-item.tsx";
import { useCallback, useEffect, useState } from "react";
import NftList from "../nft-list/nft-list";

const UserNftList = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [userNfts, setUserNfts] = useState<Nft[] | null>(null);
  const wallet = useWallet();
  const { connection } = useConnection();

  const fetchUserNfts = useCallback(async () => {
    if (userNfts) return;
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
  }, [connection, publicKey, userNfts]);

  useEffect(() => {
    if (!wallet?.publicKey) return;
    setPublicKey(wallet.publicKey?.toString());
    fetchUserNfts();
  }, [fetchUserNfts, wallet, wallet.publicKey]);

  return (
    <div>
      <div>
        <NftList />
      </div>
      {!!userNfts &&
        userNfts
          .filter(
            ({ creators }) =>
              creators?.[0]?.address?.toString() === CREATOR_ADDRESS
          )
          .map((nft) => <NftListItem nft={nft} key={String(nft.address)} />)}
    </div>
  );
};

export default UserNftList;
