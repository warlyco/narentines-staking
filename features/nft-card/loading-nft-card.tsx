import bg from "public/images/single-item-bg.png";

const LoadingNftCard = () => (
  <div
    className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative"
    style={{ backgroundImage: `url(${bg.src})` }}
  >
    <div className="w-full object-cover lg:max-h-[280px] mb-2 pt-[100%] bg-slate-500 animate-pulse"></div>
    <div className="space-y-4">
      <div className="">
        <div className="w-full flex h-10 bg-slate-500 animate-pulse rounded"></div>
      </div>
    </div>
  </div>
);

export default LoadingNftCard;
