import React from 'react';
import { TABLE_HEADERS } from '@/constants/customer-service/CompareBetweenEmployees';
import { getPerformanceRating } from '@/lib/customers/getPerformanceRating';

interface ITableRow {
  id: number;
  name: string;
  performance: number;
  totalCalls: string;
  confirmed: string;
  cancelled: string;
  postponed: string;
  noResponse: string;
  incomplete: string;
  workHours: string;
  breakDuration: string;
}

interface ITableProps {
  data: ITableRow[];
  type: boolean;
  name: string;
}

function Table({ data, type, name }: ITableProps) {
  return (
    <div className="w-full p-4 sm:p-6 md:p-7 bg-white mt-10 rounded-2xl shadow-xl">
      <h1 className="font-semibold mb-6 sm:mb-18">{name}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px] sm:min-w-full">
          <thead>
            <tr className="grid grid-cols-10 bg-[#f2edfd] items-center sm:py-2 rounded-sm mb-2 text-[12px] sm:text-sm">
              {TABLE_HEADERS.map((header) => (
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
              const { rating, color } = getPerformanceRating(row.performance);

              return (
                <tr
                  key={row.id}
                  className="grid grid-cols-10 border-b border-gray-100 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <td className="py-2 sm:p-5 text-center truncate">
                    {row.name}
                  </td>

                  <td className="p-3 sm:p-5 text-center flex justify-center items-center gap-2">
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

                  <td className="py-3 sm:p-5 text-center">{row.totalCalls}</td>
                  <td className="py-3 sm:p-5 text-center">{row.confirmed}</td>
                  <td className="py-3 sm:p-5 text-center">{row.cancelled}</td>
                  <td className="py-3 sm:p-5 text-center">{row.postponed}</td>
                  <td className="py-3 sm:p-5 text-center">{row.noResponse}</td>
                  <td className="py-3 sm:p-5 text-center">{row.incomplete}</td>
                  <td className="py-3 sm:p-5 text-center">{row.workHours}</td>
                  <td className="py-3 sm:p-5 text-center">
                    {row.breakDuration}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
