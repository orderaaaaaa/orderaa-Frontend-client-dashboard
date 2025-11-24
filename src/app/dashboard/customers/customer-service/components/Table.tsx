import React from 'react';
import { TABLE_HEADERS } from '@/constants/customer-service/CompareBetweenEmployees';
import { getPerformanceRating } from '@/lib/customers/getPerformanceRating';

interface ITableHeader {
  id: number;
  key: string;
  label: string;
}

interface ITableRow {
  id: number;
  name?: string;
  employee?: string;
  performance?: number;
  totalCalls?: string;
  confirmed?: string;
  cancelled?: string;
  postponed?: string;
  noResponse?: string;
  noAnswer?: string;
  incomplete?: string;
  workHours?: string;
  breakDuration?: string;
  stopDuration?: string;
  afterFirst?: string;
  afterSecond?: string;
  afterThird?: string;
  [key: string]: any;
}

interface ITableProps {
  data: ITableRow[];
  type: boolean;
  headers?: ITableHeader[];
}

function Table({ data, type, headers }: ITableProps) {
  const tableHeaders = headers || TABLE_HEADERS;
  const columnsCount = tableHeaders.length;

  // Map column counts to Tailwind grid classes
  const gridColsMap: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  };

  const gridColsClass = gridColsMap[columnsCount] || 'grid-cols-1';

  return (
    <div className="overflow-x-auto mt-14">
      <table className="w-full border-collapse min-w-[700px] sm:min-w-full">
        <thead>
          <tr
            className={`grid ${gridColsClass} bg-[#f2edfd] items-center sm:py-2 rounded-sm mb-2 text-[12px] sm:text-sm`}
          >
            {tableHeaders.map((header) => (
              <th
                key={header.id}
                className="py-2 sm:px-5 font-semibold text-center"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data?.map((row) => {
            const { rating, color } = row.performance
              ? getPerformanceRating(row.performance)
              : { rating: '', color: '' };

            return (
              <tr
                key={row.id}
                className={`grid ${gridColsClass} border-b border-gray-100 hover:bg-gray-50 transition-colors text-xs sm:text-sm`}
              >
                {tableHeaders.map((header) => {
                  // Handle special case for performance column with type prop
                  if (
                    header.key === 'performance' &&
                    row.performance !== undefined
                  ) {
                    return (
                      <td
                        key={header.id}
                        className="p-3 sm:p-5 text-center flex justify-center items-center gap-2"
                      >
                        <span>{row.performance}%</span>
                        {type && (
                          <span
                            className="px-2 py-1 text-white text-xs rounded-sm"
                            style={{ backgroundColor: color }}
                          >
                            {rating}
                          </span>
                        )}
                      </td>
                    );
                  }

                  // Handle name/employee column
                  if (header.key === 'name' || header.key === 'employee') {
                    return (
                      <td
                        key={header.id}
                        className="py-2 sm:p-5 text-center truncate"
                      >
                        {row.name || row.employee}
                      </td>
                    );
                  }

                  // Default: render cell value
                  return (
                    <td key={header.id} className="py-3 sm:p-5 text-center">
                      {row[header.key] || '-'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
