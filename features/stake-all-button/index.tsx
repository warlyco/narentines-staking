const StakeAllButton = () => {
  const stakeAllNfts = () => {};
  return (
    <button
      onClick={stakeAllNfts}
      className="border-2 border-green-800 bg-green-800 text-2xl p-2 rounded text-amber-400 hover:bg-amber-200 hover:text-green-800 uppercase"
    >
      Stake All
    </button>
  );
};

export default StakeAllButton;
