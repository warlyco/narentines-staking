import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="w-full border-b shadow">
      <div
        className={`flex justify-between items-center max-w-5xl m-auto px-4 h-${NAV_HEIGHT_IN_REMS} -mt-[1px]`}
      >
        <Link href="/">
          <h1 className="cursor-pointer text-4xl">staking</h1>
        </Link>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
