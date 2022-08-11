import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";
import bg from "public/images/bg-pattern.png";
import { minHeight } from "@mui/system";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <div
        style={{
          overflowX: "hidden",
          backgroundImage: `url(${bg.src})`,
          minHeight: "100vh",
        }}
        className="-mt-16"
      >
        <div className="pt-16 max-w-5xl mx-auto">{children}</div>
      </div>
    </>
  );
}
