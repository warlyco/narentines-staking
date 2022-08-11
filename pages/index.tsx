import ClientOnly from "features/client-only";
import UserNftList from "features/user-nft-list";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="h-full w-full flex">
      <div className="max-w-5xl p-4 pt-8 text-2xl">
        <ClientOnly>
          <UserNftList />
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
