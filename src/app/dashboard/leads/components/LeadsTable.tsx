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

// --- Helper Components ---

const getLeadTypeBadge = (leadType: string) => {
  const config = LEADS_STATS_CONFIG.find(
    (stat) =>
      stat.key === leadType ||
      stat.title.toLowerCase().includes(leadType.toLowerCase())
  );

  if (!config) return null;

  const Icon = config.icon;
  return (
    <span
      className="px-3 py-1.5 rounded-full font-medium text-xs inline-flex items-center gap-1.5 border"
      style={{
        backgroundColor: config.iconBgColor,
        color: config.iconColor,
        borderColor: config.iconColor,
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
      className="px-3 py-1 min-w-20 rounded-lg font-semibold text-xs border inline-block text-center whitespace-nowrap"
      style={{ color: style.text, borderColor: style.border }}
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">
          الليدز ( {data.length} )
        </h3>
        <div className="flex gap-2">
          {showCheckboxes && (
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            >
              {selectedRows.size === data.length ? 'إلغاء الكل' : 'تحديد الكل'}
            </button>
          )}
          <button
            onClick={() => {
              setShowCheckboxes(!showCheckboxes);
              setSelectedRows(new Set());
            }}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-primary text-white"
          >
            {showCheckboxes ? 'إلغاء' : 'تحديد متعدد'}
          </button>
        </div>
      </div>

      {/* --- Mobile Cards View --- */}
      <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
        {data.map((row) => (
          <div
            key={row.id}
            className={`bg-white p-4 rounded-xl border-2 transition-all ${
              selectedRows.has(row.id)
                ? 'border-primary shadow-md'
                : 'border-transparent shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              {showCheckboxes && (
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                  className="w-5 h-5 mt-1 accent-primary"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">{row.name}</span>
                  {row.status &&
                    getStatusBadge(row.status, row.statusText || '')}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <LiaWhatsapp className="text-green-600" />
                    <span className="text-sm">{row.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <GoMail className="text-blue-500" />
                    <span className="text-sm">{row.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 text-xs">
                  <div>
                    <p className="text-gray-400 mb-1">المصدر</p>
                    <p className="font-medium">{row.source}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">النوع</p>
                    {getLeadTypeBadge(row.leadType)}
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">التوقيت</p>
                    <p className="font-medium">{row.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">آخر تواصل</p>
                    <div className="flex items-center gap-1 font-medium">
                      <RiFileCheckLine /> {row.action}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Desktop Table View --- */}
      <div className="hidden md:block overflow-x-auto mt-5 bg-white p-6 rounded-lg">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#f2edfd] text-sm">
              {showCheckboxes && (
                <th className="py-4 px-4 text-center rounded-r-md w-[40px]">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </th>
              )}
              {tableHeaders.map((header, index) => (
                <th
                  key={header.id}
                  className={`py-4 px-4 font-semibold text-gray-900 ${
                    header.key === 'client' ? 'text-right' : 'text-center'
                  } ${
                    index === tableHeaders.length - 1 ? 'rounded-l-md' : ''
                  } ${index === 0 && !showCheckboxes ? 'rounded-r-md' : ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {data.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                {showCheckboxes && (
                  <td className="py-5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                )}
                {tableHeaders.map((header) => (
                  <td
                    key={header.id}
                    className={`py-5 px-4 ${
                      header.key === 'client' ? 'text-right' : 'text-center'
                    }`}
                  >
                    {/* Reuse your existing <If/Then> logic here or switch to a cleaner switch case */}
                    <If condition={header.key === 'client'}>
                      <Then>
                        <div className="flex items-center gap-3">
                          {row.status &&
                            getStatusBadge(row.status, row.statusText || '')}
                          <span className="font-bold">{row.name}</span>
                        </div>
                      </Then>
                    </If>
                    {/* ... (Repeat your specific logic for contact, source, leadType, etc. as per your original file) ... */}
                    <If condition={header.key === 'contact'}>
                      <Then>
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1">
                            <LiaWhatsapp className="text-gray-400" />{' '}
                            {row.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <GoMail className="text-gray-400" /> {row.email}
                          </div>
                        </div>
                      </Then>
                    </If>
                    <If condition={header.key === 'source'}>
                      <Then>{row.source}</Then>
                    </If>
                    <If condition={header.key === 'leadType'}>
                      <Then>{getLeadTypeBadge(row.leadType)}</Then>
                    </If>
                    <If condition={header.key === 'time'}>
                      <Then>{row.time}</Then>
                    </If>
                    <If condition={header.key === 'lastContact'}>
                      <Then>
                        <div className="flex justify-center items-center gap-1">
                          <RiFileCheckLine /> {row.action}
                        </div>
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
