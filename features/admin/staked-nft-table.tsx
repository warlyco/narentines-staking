import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";

type CollectionNft = {
  image: string;
  name: string;
  lastClaimTimestamp: string | null;
  mintAddress: string;
  ownerWalletAddress: string | null;
};

const defaultData: CollectionNft[] = [
  {
    image: "https://arweave.net/1NB3wxPwaBoBeWc_omZcTM4A_yxPVTZNT5s3t3Q-l98",
    name: "Narentines #1738",
    lastClaimTimestamp: "2022-08-19T06:25:16.625411+00:00",
    mintAddress: "8VJ8u76EmbTn14DnnhL8qQ5jbZ9KhvGvQZgV1APAZdRy",
    ownerWalletAddress: "44Cv2k5kFRzGQwBLEBc6aHHTwTvEReyeh4PHMH1cBgAe",
  },
  {
    image: "https://arweave.net/PI5-WP34EuMW79ho81ptP77UZxY74Ewu0TCZuikdsD4",
    name: "Narentines #6215",
    lastClaimTimestamp: "2022-08-19T06:25:16.625411+00:00",
    mintAddress: "Evioyo8VU7a6cnsFoZvZT8dGJiumVRQSSvW6virvc1ZZ",
    ownerWalletAddress: "FoEBsma7PQLAp55pkvsJzNM5ERgmPwz8E2CU9ZJe8zMo",
  },
  {
    image: "https://arweave.net/kZJXykC656YLCLZKwAk46t6pXKWkwe-TmlenoU0U7FE",
    name: "Narentines #4284",
    lastClaimTimestamp: null,
    mintAddress: "4GyQt88QReHQxJRzd8Fzt6yTk2AVgVS4tGDkv25qib4r",
    ownerWalletAddress: null,
  },
];

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
        className="py-1 rounded"
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
      <div className="w-32 px-2 truncate">
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
  const [data, setData] = React.useState(() => [...defaultData]);
  const rerender = React.useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2 bg-amber-200">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
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
            <tr key={row.id}>
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
