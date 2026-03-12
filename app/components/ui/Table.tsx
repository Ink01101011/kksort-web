export type Columns<T> = {
  key: keyof T;
  label: string;
};

type TableProps<T extends Object> = {
  data: T[];
  cols: Columns<T>[];
};

function Table<T extends Object>({ data, cols }: TableProps<T>) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-neutral-100">
          {cols.map((col) => (
            <th
              key={col.key as string}
              className="border border-black px-3 py-2 text-left"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item[cols[0].key] as string}>
            {cols.map((col) => (
              <td
                key={col.key as string}
                className="border border-black px-3 py-2 font-mono"
              >
                {String(item[col.key as keyof T])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
