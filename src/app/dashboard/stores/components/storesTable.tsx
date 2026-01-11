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

  const isActive = status === 'active';
  return (
    <span
      className={`px-4 py-1 font-semibold rounded-md border inline-block text-sm ${
        isActive
          ? 'bg-[#f7fdf5] text-[#3cc900] border-[#3cc900]'
          : 'bg-[#f5f5f5] text-[#626262] border-[#626262]'
      }`}
    >
      {isActive ? 'نشط' : 'غير نشط'}
    </span>
  );
};

function StoresTable({ data, headers }: StoresTableProps) {
  const tableHeaders = headers || STORES_TABLE_HEADERS;

  return (
    <div className="mt-8">
      {/* --- Mobile Cards View --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((row) => (
          <div
            key={row.id}
            className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">اسم المتجر</span>
                <span className="font-bold text-gray-900">{row.storeName}</span>
              </div>
              {getStatusBadge(row.status)}
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t pt-4">
              {tableHeaders
                .filter((h) => !['storeName', 'actions'].includes(h.key))
                .map((header) => (
                  <div key={header.id} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">
                      {header.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {row[header.key as keyof IStoreTableRow] ?? '-'}
                    </span>
                  </div>
                ))}

              <div className="flex flex-col col-span-2">
                <span className="text-xs text-gray-500 mb-1">الإجراءات</span>
                <span
                  className={
                    row.actions === 'حظر'
                      ? 'text-red-500 text-sm'
                      : 'text-gray-400'
                  }
                >
                  {row.actions === 'حظر' ? row.actions : '-'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Desktop Table View --- */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg p-8">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#f2edfd] text-sm">
              {tableHeaders.map((header, index) => (
                <th
                  key={header.id}
                  className={`py-4 px-4 font-semibold text-gray-900 ${
                    header.key === 'storeName'
                      ? 'text-right rounded-r-md w-[20%]'
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
                      header.key === 'storeName' ? 'text-right' : 'text-center'
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

                    <If condition={header.key === 'actions'}>
                      <Then>
                        <span
                          className={
                            row.actions === 'حظر'
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }
                        >
                          {row.actions === 'حظر' ? row.actions : '-'}
                        </span>
                      </Then>
                    </If>

                    <If
                      condition={!['storeName', 'actions'].includes(header.key)}
                    >
                      <Then>
                        {row[header.key as keyof IStoreTableRow] ?? '-'}
                      </Then>
                    </If>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StoresTable;
