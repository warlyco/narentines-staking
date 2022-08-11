import classNames from "classnames";
import ClientOnly from "features/client-only";
import UserNftList from "features/user-nft-list";
import type { NextPage } from "next";
import { useState } from "react";

enum WalletType {
  STAKING = "STAKING",
  USER = "USER",
}

const Home: NextPage = () => {
  const [activeWallet, setActiveWallet] = useState<WalletType>(WalletType.USER);

  return (
    <div className="h-full w-full flex">
      <div className="max-w-5xl p-4 text-2xl w-full">
        <ClientOnly>
          <div className="flex pb-2 space-x-2">
            <button
              className={classNames({
                "p-2 px-4 rounded  text-white uppercase text-xl pt-2.5 border-2 border-green-800":
                  true,
                "bg-green-800": activeWallet === WalletType.USER,
                "bg-transparent": activeWallet !== WalletType.USER,
              })}
              onClick={() => setActiveWallet(WalletType.USER)}
            >
              Wallet
            </button>
            <button
              className={classNames({
                "p-2 px-4 rounded text-white uppercase text-xl pt-2.5 border-2 border-green-800":
                  true,
                "bg-green-800": activeWallet === WalletType.STAKING,
                "bg-transparent": activeWallet !== WalletType.STAKING,
              })}
              onClick={() => setActiveWallet(WalletType.STAKING)}
            >
              Staked
            </button>
          </div>
          {activeWallet === WalletType.USER && <UserNftList />}
          {activeWallet === WalletType.STAKING && <div>Staked</div>}
        </ClientOnly>
      </div>
    </div>
  );
};

export default Home;
