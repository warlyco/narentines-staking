import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";
import bg from "public/images/bg-pattern.png";
import { useState } from "react";
import Sidebar from "features/sidebar";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  return (
    <>
      <div
        style={{
          overflowX: "hidden",
          backgroundImage: `url(${bg.src})`,
          minHeight: "100vh",
        }}
      >
        <div className="max-w-5xl mx-auto pt-24">{children}</div>
      </div>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpenSidebar={isOpenSidebar} toggleSidebar={toggleSidebar} />
    </>
  );
}
