import { useWallet } from "@solana/wallet-adapter-react";
import AdminPanel from "features/admin/admin-panel";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

const { NEXT_PUBLIC_ADMIN_WALLETS } = process.env;

const Admin: NextPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet || !wallet.publicKey || !NEXT_PUBLIC_ADMIN_WALLETS) return;
    if (NEXT_PUBLIC_ADMIN_WALLETS.includes(String(wallet.publicKey))) {
      setIsAdmin(true);
    }
  }, [wallet, wallet.publicKey]);

  return (
    <div className="h-full w-full flex max-w-5xl mx-auto p-4 py-6 text-center">
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <div className="text-2xl pt-24 text-center w-full">
          you need to be an admin to view this page
        </div>
      )}
    </div>
  );
};

export default Admin;
