import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  toggleSidebar: () => void;
};

export const Navbar = ({ toggleSidebar }: Props) => {
  const { publicKey } = useWallet();
  return (
    <div className="w-full fixed top-0">
      <div className="flex justify-between items-center max-w-5xl m-auto p-4">
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

        <div className="hidden lg:flex items-center space-x-2">
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-medium shadow-xl"
            href="//www.narentines.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Home
          </a>
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-medium shadow-xl"
            href="//explore.narentines.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the Valley
          </a>
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-medium shadow-xl"
            href="https://narentines.floppylabs.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Old Staking
          </a>
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-medium shadow-xl"
            href="//bazaar.narentines.com/raffle"
            rel="noopener noreferrer"
          >
            Raffle
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-pink-400 hover:border-2 hover:border-pink-400 rounded-lg text-black shadow-xl"
            href="//magiceden.io/marketplace/narentinesnft"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              height={32}
              width={32}
              src="/images/magic-eden.webp"
              alt="Medium"
              className="cursor-pointer rounded-lg"
            />
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl"
            href="//twitter.com/narentines"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              height={14}
              width={16}
              src="/images/twitter-black.svg"
              alt="Twitter"
              className="cursor-pointer"
            />
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl"
            target="_blank"
            rel="noopener noreferrer"
            href="//discord.gg/9Dfh3PJG8S"
          >
            <Image
              height={18}
              width={20}
              src="/images/discord-black.svg"
              alt="Discord"
              className="cursor-pointer"
            />
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl"
            target="_blank"
            rel="noopener noreferrer"
            href="//narentines.medium.com/"
          >
            <Image
              height={18}
              width={20}
              src="/images/medium-black.svg"
              alt="Medium"
              className="cursor-pointer"
            />
          </a>
        </div>
        <button
          onClick={toggleSidebar}
          className="flex items-center rounded-md lg:hidden"
        >
          <Image
            height={34}
            width={37}
            src="/images/hamburger.svg"
            alt="Medium"
            className="cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
