'use client';

import React, { useState } from 'react';
import { If, Then } from 'react-if';
import { ILeadTableRow, ILeadTableHeader } from '../types/leads';
import { LEADS_TABLE_HEADERS } from '../constants/leadsDummyData';
import { LEADS_STATS_CONFIG } from '../constants/leadsConfig';
import { GoMail } from 'react-icons/go';
import { RiFileCheckLine } from 'react-icons/ri';
import { LiaWhatsapp } from 'react-icons/lia';

interface LeadsTableProps {
  data: ILeadTableRow[];
  headers?: ILeadTableHeader[];
}

const getLeadTypeBadge = (leadType: string) => {
  const config = LEADS_STATS_CONFIG.find(
    (stat) =>
      stat.key === leadType ||
      stat.title.toLowerCase().includes(leadType.toLowerCase())
  );

  if (!config) return null;

  const Icon = config.icon;
  const bgColor = config.iconBgColor;
  const textColor = config.iconColor;

  return (
    <span
      className="px-3 py-1.5 rounded-full font-medium text-sm inline-flex items-center gap-1.5 border"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: textColor,
      }}
    >
      <Icon />
      {config.title}
    </span>
  );
};

const getStatusBadge = (status: string, statusText: string) => {
  const statusStyles: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    trialEnding: { bg: '#fff3e0', text: '#3085f2', border: '#3085f2' },
    paid: { bg: '#e8f5e9', text: '#3cc800', border: '#3cc800' },
    trialEnded: { bg: '#ffebee', text: '#f34336', border: '#f34336' },
    new: { bg: '#e3f2fd', text: '#5d24e1', border: '#5d24e1' },
  };

  const style = statusStyles[status] || statusStyles.new;

  return (
    <span
      className="px-3 py-1 min-w-23 rounded-lg font-semibold text-sm border inline-block text-center whitespace-nowrap"
      style={{
        color: style.text,
        borderColor: style.border,
      }}
    >
      {statusText}
    </span>
  );
};

function LeadsTable({ data, headers }: LeadsTableProps) {
  const tableHeaders = headers || LEADS_TABLE_HEADERS;
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="mt-8 rounded-lg">
      {/* Header with checkbox toggle */}
      <div className="flex items-center justify-between p-4">
        <h3 className="text-xl font-bold text-gray-900">
          الليدز ( {data.length} )
        </h3>
        <button
          onClick={() => {
            setShowCheckboxes(!showCheckboxes);
            setSelectedRows(new Set());
          }}
          className="px-4 py-2 text-sm font-semibold border border-primary rounded-lg bg-primary text-white transition-colors cursor-pointer"
        >
          {showCheckboxes ? 'إخفاء التحديد' : 'تحديد متعدد'}
        </button>
      </div>

      <div className="overflow-x-auto mt-5">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-[#f2edfd] text-sm">
              {showCheckboxes && (
                <th className="py-4 px-4 text-center rounded-r-md w-[3%]">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                </th>
              )}
              {tableHeaders.map((header, index) => (
                <th
                  key={header.id}
                  className={`py-4 px-4 font-semibold text-gray-900 ${
                    header.key === 'client'
                      ? `text-right ${
                          !showCheckboxes ? 'rounded-r-md' : ''
                        } w-[15%]`
                      : header.key === 'contact'
                      ? 'text-center w-[12%]'
                      : header.key === 'source'
                      ? 'text-center w-[10%]'
                      : header.key === 'leadType'
                      ? 'text-center w-[12%]'
                      : header.key === 'time'
                      ? 'text-center w-[12%]'
                      : header.key === 'lastContact'
                      ? 'text-center w-[15%]'
                      : index === tableHeaders.length - 1
                      ? 'text-center rounded-l-md w-[10%]'
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
                {showCheckboxes && (
                  <td className="py-5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                  </td>
                )}

                {tableHeaders.map((header) => (
                  <td
                    key={header.id}
                    className={`py-5 px-4 text-gray-900 ${
                      header.key === 'client' ? 'text-right' : 'text-center'
                    }`}
                  >
                    <If condition={header.key === 'client'}>
                      <Then>
                        <div className="flex items-center justify-start gap-3">
                          {row.status && (
                            <div>
                              {getStatusBadge(row.status, row.statusText || '')}
                            </div>
                          )}
                          <div className="font-bold text-gray-900">
                            {row.name}
                          </div>
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'contact'}>
                      <Then>
                        <div className="flex flex-col gap-2 items-start">
                          <div className="flex items-center gap-2">
                            <LiaWhatsapp className="w-5 h-5 text-gray-500" />
                            <span className="text-sm">{row.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GoMail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{row.email}</span>
                          </div>
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'source'}>
                      <Then>
                        <span className="text-gray-900 font-medium">
                          {row.source}
                        </span>
                      </Then>
                    </If>

                    <If condition={header.key === 'leadType'}>
                      <Then>
                        <div className="flex justify-center">
                          {getLeadTypeBadge(row.leadType)}
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'time'}>
                      <Then>
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{row.time}</span>
                          </div>
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'lastContact'}>
                      <Then>
                        <div className="flex justify-center items-center gap-2  text-gray-700">
                          <RiFileCheckLine />
                          {row.action}
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'state'}>
                      <Then>
                        <span
                          className="font-medium inline-block min-w-[120px]"
                          style={{
                            color:
                              row.state === 'لم يدفع'
                                ? '#757575'
                                : row.state?.includes('نشطة')
                                ? '#3cc900'
                                : row.state?.includes('تم')
                                ? '#3cc900'
                                : row.state?.includes('قرب الانتهاء')
                                ? '#d84315'
                                : '#1565c0',
                          }}
                        >
                          {row.state}
                        </span>
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

export default LeadsTable;
