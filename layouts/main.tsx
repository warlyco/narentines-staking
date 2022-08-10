import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <div
        style={{
          height: `calc(100vh - 4rem)`,
          overflowX: "hidden",
        }}
        className="-mt-16"
      >
        <div className="pt-16 max-w-5xl mx-auto">{children}</div>
      </div>
    </>
  );
}
