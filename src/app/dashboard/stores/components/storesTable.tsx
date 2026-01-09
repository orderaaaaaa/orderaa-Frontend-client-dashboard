import React from 'react';
import { If, Then } from 'react-if';
import { IStoreTableHeader, IStoreTableRow } from '../types/stores';
import { STORES_TABLE_HEADERS } from '../constants/storesTable';

interface StoresTableProps {
  data: IStoreTableRow[];
  headers?: IStoreTableHeader[];
}

const getStatusBadge = (status?: 'active' | 'inactive') => {
  if (!status) return null;

  if (status === 'active') {
    return (
      <span className="px-4 bg-[#f7fdf5] text-[#3cc900] font-semibold rounded-md border border-[#3cc900] inline-block">
        نشط
      </span>
    );
  }

  return (
    <span className="px-2 bg-[#f5f5f5] text-[#626262] font-semibold rounded-md border border-[#626262] inline-block">
      غير نشط
    </span>
  );
};

function StoresTable({ data, headers }: StoresTableProps) {
  const tableHeaders = headers || STORES_TABLE_HEADERS;

  return (
    <div className="overflow-x-auto mt-8 bg-white rounded-lg p-8">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-[#f2edfd] text-sm">
            {tableHeaders.map((header, index) => (
              <th
                key={header.id}
                className={`py-4 px-4 font-semibold text-gray-900 ${
                  header.key === 'storeName'
                    ? 'text-right rounded-r-md w-[10%]'
                    : index === tableHeaders.length - 1
                    ? 'text-center rounded-l-md'
                    : 'text-center'
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {data.map((row, index) => (
            <tr
              key={row.id}
              className={`hover:bg-gray-50 transition-colors font-medium ${
                index !== data.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {tableHeaders.map((header) => (
                <td
                  key={header.id}
                  className={`py-5 px-4 text-gray-900 ${
                    header.key === 'storeName'
                      ? 'text-right w-[14%]'
                      : 'text-center'
                  }`}
                >
                  <If condition={header.key === 'storeName'}>
                    <Then>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(row.status)}
                        <span className="text-gray-900 font-medium">
                          {row.storeName}
                        </span>
                      </div>
                    </Then>
                  </If>

                  <If condition={header.key === 'deliveryRate'}>
                    <Then>
                      <span className="font-medium text-gray-900">
                        {row.deliveryRate ?? '-'}
                      </span>
                    </Then>
                  </If>

                  <If condition={header.key === 'actions'}>
                    <Then>
                      <If condition={row.actions === 'حظر'}>
                        <Then>
                          <span className="text-gray-600">{row.actions}</span>
                        </Then>
                      </If>
                      <If condition={row.actions !== 'حظر'}>
                        <Then>
                          <span className="text-gray-400">-</span>
                        </Then>
                      </If>
                    </Then>
                  </If>

                  <If
                    condition={
                      header.key !== 'storeName' &&
                      header.key !== 'deliveryRate' &&
                      header.key !== 'actions'
                    }
                  >
                    <Then>{row[header.key] ?? '-'}</Then>
                  </If>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StoresTable;
