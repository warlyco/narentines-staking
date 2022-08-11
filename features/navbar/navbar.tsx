import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="w-full border-b shadow">
      <div className="flex justify-between items-center max-w-5xl m-auto px-4 h-24  -mt-[1px]">
        <Link href="/">
          <a className="flex items-center">
            <Image
              src="/images/logo.svg"
              width="236"
              height="43"
              alt="logo"
              className="cursor-pointer"
            />
          </a>
        </Link>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
