import Image from "next/image";

const Spinner = () => (
  <Image
    className="animate-spin"
    src="/images/loader.svg"
    height={30}
    width={30}
    alt="Loading"
  />
);

export default Spinner;
