import classNames from "classnames";
import toast from "react-hot-toast";
import axios from "axios";
import dayjs from "dayjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useIsLoading } from "hooks/is-loading";
import { useReactTable } from "@tanstack/react-table";
import StakedNftTable from "./staked-nft-table";

const AdminPanel = () => {
  const { setIsLoading, isLoading } = useIsLoading();
  const { publicKey, signMessage } = useWallet();

  const handleSubmit = () => {};

  return (
    <div className="w-full mx-auto">
      <h1 className="text-4xl text-center w-full pb-8">Staked</h1>
      <StakedNftTable />
      {/* <form className="space-y-4">
        <div>
          <button
            onClick={handleSubmit}
            className={classNames({
              "p-4 py-2 rounded border shadow": true,
              "bg-slate-400 animate-pulse": isLoading,
              "cursor-pointer": !isLoading,
            })}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form> */}
    </div>
  );
};

export default AdminPanel;
