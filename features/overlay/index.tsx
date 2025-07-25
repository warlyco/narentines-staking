import classNames from "classnames";
import Spinner from "features/UI/spinner";
import { useIsLoading } from "hooks/is-loading";
import ScrollLock from "react-scrolllock";
import { ModalTypes } from "types";

type Props = {
  onClick?: () => void;
  isVisible: boolean;
  modalType?: ModalTypes;
};

const Overlay = ({ onClick, isVisible, modalType }: Props) => {
  const { loadingMessage, setLoadingMessage } = useIsLoading();

  return (
    <>
      <ScrollLock isActive={isVisible}>
        <div
          onClick={onClick}
          className={classNames({
            "absolute top-0 right-0 bottom-0 left-0 transition-all duration-500 ease-in-out bg-opaque bg-black py-6":
              isVisible,
            "opacity-0 pointer-events-none": !isVisible,
          })}
        >
          {!!loadingMessage?.length && (
            <div className="bg-amber-200 m-auto fixed top-1/2 left-1/2 centered p-4 rounded">
              <div className="text-center">
                <div className="font-medium text-2xl">{loadingMessage}</div>
                <div className="py-4 italic">
                  Please do not close this window
                </div>
                <div>
                  <Spinner />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollLock>
      <style>
        {`
          .bg-opaque {
            background-color: rgba(0,0,0,0.6);
          }
          .centered {
            transform: translate(-50%, -50%);

          }
        `}
      </style>
    </>
  );
};

export default Overlay;
