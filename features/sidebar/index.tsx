import classNames from "classnames";
import ClientOnly from "features/client-only";
import Image from "next/image";
import Link from "next/link";
import bg from "public/images/bg-black.png";
import ScrollLock from "react-scrolllock";

type Props = {
  isOpenSidebar: boolean;
  toggleSidebar: () => void;
};

export const Sidebar = ({ isOpenSidebar, toggleSidebar }: Props) => {
  const handleCloseSidebar = () => {
    if (isOpenSidebar) {
      toggleSidebar();
    }
  };

  return (
    <ClientOnly>
      <ScrollLock isActive={isOpenSidebar}>
        <div
          onClick={handleCloseSidebar}
          className={classNames({
            "absolute top-0 right-0 bottom-0 left-0 transition-opacity duration-500 ease-in-out opacity-40 bg-slate-800 py-6":
              isOpenSidebar,
            "opacity-0 pointer-events-none": !isOpenSidebar,
          })}
        ></div>
      </ScrollLock>
      <div
        className={classNames({
          "fixed top-0 right-0 bottom-0 w-full sm:w-[380px] h-screen transition-position duration-500 ease-in-out py-4":
            true,
          "-mr-[1000px]": !isOpenSidebar,
        })}
      >
        <div className="p-2 h-full">
          <div
            className="h-full rounded-md shadow-2xl p-6 flex flex-col w-full overflow-auto"
            style={{ backgroundImage: `url(${bg.src})` }}
          >
            <button
              className="text-amber-400 self-end text-4xl mb-8"
              onClick={handleCloseSidebar}
            >
              <Image
                height={37}
                width={36}
                src="/images/close-menu.svg"
                alt="Medium"
                className="cursor-pointer"
              />
            </button>
            <div className="flex flex-col space-y-8 flex-grow">
              <div>
                <a
                  className="bg-amber-200 hover:bg-amber-400 text-2xl px-3 py-2 uppercase rounded-lg font-bold"
                  href="//narentines.com"
                  target="_blank"
                  onClick={handleCloseSidebar}
                  rel="noopener noreferrer"
                >
                  Home
                </a>
              </div>
              <div>
                <a
                  className="bg-amber-200 hover:bg-amber-400 text-2xl px-3 py-2 uppercase rounded-lg font-bold"
                  href="//explore.narentines.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseSidebar}
                >
                  Explore the Valley
                </a>
              </div>
              <div>
                <div className="bg-amber-200 hover:bg-amber-400 text-2xl px-3 uppercase rounded-lg font-bold py-[4px] inline-block -mt-1">
                  <a
                    rel="noopener noreferrer"
                    href="//bazaar.narentines.com/raffle"
                    onClick={handleCloseSidebar}
                    className="inline-block"
                  >
                    Raffle
                  </a>
                </div>
              </div>
              {/* <div>
                <a
                  className="bg-red-700 hover:bg-red-900 text-amber-200 text-2xl px-3 uppercase rounded-lg font-bold"
                  href=""
                >
                  Litepaper
                </a>
              </div> */}
            </div>
            <div className="flex bottom-0 space-x-2 pt-8 pb-8">
              <a
                className="flex justify-center items-center h-12 w-12 bg-amber-200 hover:bg-amber-400 rounded-lg text-black"
                href="//twitter.com/narentines"
                onClick={handleCloseSidebar}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  height={18}
                  width={20}
                  src="/images/twitter-black.svg"
                  alt="Twitter"
                  className="cursor-pointer"
                />
              </a>
              <a
                className="flex justify-center items-center h-12 w-12 bg-amber-200 hover:bg-amber-400 rounded-lg text-black"
                href="//discord.gg/9Dfh3PJG8S"
                onClick={handleCloseSidebar}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  height={22}
                  width={25}
                  src="/images/discord-black.svg"
                  alt="Discord"
                  className="cursor-pointer"
                />
              </a>
              <a
                className="flex justify-center items-center h-12 w-12 bg-amber-200 hover:bg-amber-400 rounded-lg text-black"
                href="//narentines.medium.com/"
                onClick={handleCloseSidebar}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  height={22}
                  width={25}
                  src="/images/medium-black.svg"
                  alt="Medium"
                  className="cursor-pointer"
                />
              </a>
              <a
                className="flex justify-center items-center h-12 w-12 bg-black border border-amber-200 hover:bg-pink-400 hover:border-2 hover:border-pink-400 rounded-lg text-black shadow-xl"
                href="//magiceden.io/marketplace/narentinesnft"
                onClick={handleCloseSidebar}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  height={40}
                  width={40}
                  src="/images/magic-eden.webp"
                  alt="Medium"
                  className="cursor-pointer rounded-lg"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default Sidebar;
