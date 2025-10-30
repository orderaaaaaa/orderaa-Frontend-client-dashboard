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

interface IGetPerformance {
  rating: string;
  color: string;
}

interface ITableProps {
  data: ITableRow[];
  type: boolean;
}

function Table({ data, type }: ITableProps) {
  return (
    <div className="w-full max-w-[100] p-10 bg-white mt-10 rounded-2xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="grid grid-cols-10 bg-[#f2edfd] py-2 rounded-sm mb-2">
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header.id}
                  className="p-5 font-semibold text-center text-sm"
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
                  className="grid grid-cols-10 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-5 text-center text-sm">{row.name}</td>

                  <td className="p-5 text-center text-sm flex justify-center items-center gap-2">
                    <span>{row.performance}%</span>
                    {type && (
                      <span
                        className="px-2 py-1 text-white text-xs  rounded-sm"
                        style={{ backgroundColor: color }}
                      >
                        {rating}
                      </span>
                    )}
                  </td>

                  <td className="p-5 text-center text-sm">{row.totalCalls}</td>
                  <td className="p-5 text-center text-sm">{row.confirmed}</td>
                  <td className="p-5 text-center text-sm">{row.cancelled}</td>
                  <td className="p-5 text-center text-sm">{row.postponed}</td>
                  <td className="p-5 text-center text-sm">{row.noResponse}</td>
                  <td className="p-5 text-center text-sm">{row.incomplete}</td>
                  <td className="p-5 text-center text-sm">{row.workHours}</td>
                  <td className="p-5 text-center text-sm">
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
