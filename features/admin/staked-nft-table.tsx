import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import { FETCH_NFTS_BY_HOLDER_AND_OWNER } from "graphql/queries/fetch-nfts-by-holder-and-owner";
import { FETCH_NFTS_BY_HOLDER } from "graphql/queries/fetch-nfts-by-holder";
import {
  CollectionNft,
  MS_PER_DAY,
  PRIMARY_REWARD_AMOUNT_PER_DAY,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import { useEffect, useState } from "react";

const defaultData: CollectionNft[] = [];

const columnHelper = createColumnHelper<CollectionNft>();

const columns = [
  columnHelper.accessor((row) => row.image, {
    id: "image",
    cell: (info) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt="nft"
        height="80px"
        width="80px"
        className="py-1 rounded px-1"
        src={info.getValue()}
      />
    ),
    header: () => <span className="w-20 block">Image</span>,
  }),
  columnHelper.accessor("name", {
    header: () => <span className="block w-32">Name</span>,
    cell: (info) => <div className="px-2 font-bold">{info.getValue()}</div>,
  }),
  columnHelper.accessor("mintAddress", {
    header: () => "Mint Address",
    cell: (info) => (
      <div className="w-48 px-2 truncate">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-900 underline"
          href={`https://solscan.io/token/${info.getValue()}`}
        >
          {info.getValue()}
        </a>
      </div>
    ),
  }),
  columnHelper.accessor("lastClaimTimestamp", {
    header: () => <span className="min-w-[10rem] block">Last Claim</span>,
    cell: (info) =>
      info.getValue()
        ? dayjs(info.getValue()).format("MM/DD/YY @ h:mmA")
        : "N/A",
  }),
  columnHelper.accessor("unclaimedAmount", {
    header: () => <span className="block w-32">Unclaimed</span>,
    cell: (info) => <div className="px-2 font-bold">{info.getValue()}</div>,
  }),
  columnHelper.accessor("profession", {
    header: () => <span className="block w-32">Profession</span>,
    cell: (info) => (
      <div className="px-2 font-bold">
        {info.cell.row.original.profession?.name}
      </div>
    ),
  }),
  columnHelper.accessor("ownerWalletAddress", {
    header: "Owner",
    cell: (info) => (
      <div className="w-32 px-2 truncate">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-900 underline"
          href={`https://solscan.io/account/${info.getValue()}`}
        >
          {info.getValue()}
        </a>
      </div>
    ),
  }),
];

function StakedNftTable() {
  const [data, setData] = useState(() => [...defaultData]);
  const {
    loading,
    error,
    data: fetchedData,
  } = useQuery(FETCH_NFTS_BY_HOLDER, {
    variables: {
      holderWalletAddress: STAKING_WALLET_ADDRESS,
    },
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const calculatePrimaryReward = (nft: CollectionNft) => {
    const { timestamp, lastClaimTimestamp } = nft;
    const now = dayjs();
    let stakingTime;
    if (!lastClaimTimestamp) {
      stakingTime = dayjs(timestamp);
    } else {
      stakingTime = dayjs(lastClaimTimestamp);
    }
    const timeSinceStakingInMs = now.diff(stakingTime);
    const timeSinceStakingInDays = timeSinceStakingInMs / MS_PER_DAY;
    return (timeSinceStakingInDays * PRIMARY_REWARD_AMOUNT_PER_DAY).toFixed(2);
  };

  useEffect(() => {
    if (!fetchedData) return;
    const { nfts } = fetchedData;

    const newData = nfts.map((nft: CollectionNft) => {
      return {
        ...nft,
        unclaimedAmount: calculatePrimaryReward(nft),
      };
    });
    setData(newData);
  }, [fetchedData]);

  if (loading || !table?.getRowModel()) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error, please refresh.</div>;
  }

  return (
    <div className="p-2 bg-amber-200">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="w-full">
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-amber-400 w-full">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {/* <div>{JSON.stringify(cell.row.original.image)}</div> */}
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StakedNftTable;
