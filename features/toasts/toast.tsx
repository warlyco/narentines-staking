import toast from "react-hot-toast";

type Props = {
  primaryMessage: string;
  secondaryMessage?: string;
};

const showToast = ({ primaryMessage, secondaryMessage }: Props) => {
  toast.custom(
    <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-4 px-6 border-slate-400 text-center duration-200">
      <div className="font-bold text-3xl mb-2">{primaryMessage}</div>
      <div>{secondaryMessage}</div>
    </div>
  );
};

export default showToast;
