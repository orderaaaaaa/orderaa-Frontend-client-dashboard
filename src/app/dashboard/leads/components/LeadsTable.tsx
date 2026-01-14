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

/* ---------------- Helpers ---------------- */

const normalizePhone = (phone?: string) =>
  phone ? phone.replace(/\D/g, '') : '';

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

/* ---------------- Component ---------------- */

function LeadsTable({ data, headers }: LeadsTableProps) {
  const tableHeaders = headers || LEADS_TABLE_HEADERS;
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const columnWidth = `${100 / tableHeaders.length}%`;

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
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
              className="px-3 py-2 text-xs font-semibold border rounded-lg bg-gray-50"
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

      {/* ---------------- Mobile ---------------- */}
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
            <div className="relative flex items-start gap-3">
              {showCheckboxes && (
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                  className="w-5 h-5 mt-1 accent-primary"
                />
              )}

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{row.name}</span>
                  <div className="absolute top-1 left-1 flex flex-col gap-2">
                    {row.status &&
                      getStatusBadge(row.status, row.statusText || '')}
                    {getLeadTypeBadge(row.leadType)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <a
                      href={`https://wa.me/${normalizePhone(row.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LiaWhatsapp className="text-green-600" />
                    </a>
                    <a href={`tel:${normalizePhone(row.phone)}`}>
                      <span className="text-sm">{row.phone}</span>
                    </a>
                  </div>

                  <a
                    href={`mailto:${row.email}`}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <GoMail className="text-blue-500" />
                    <span className="text-sm">{row.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- Desktop ---------------- */}
      <div className="hidden md:block overflow-x-auto mt-5 bg-white p-6 rounded-lg">
        <table className="w-full min-w-[1200px] table-fixed border-collapse">
          <thead>
            <tr className="bg-[#f2edfd] text-sm">
              {showCheckboxes && (
                <th className="w-[40px] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-primary"
                  />
                </th>
              )}
              {tableHeaders.map((header) => (
                <th
                  key={header.id}
                  style={{ width: columnWidth }}
                  className="px-4 py-4 font-semibold text-center"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm">
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {showCheckboxes && (
                  <td className="px-4 py-5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 accent-primary"
                    />
                  </td>
                )}

                {tableHeaders.map((header) => (
                  <td
                    key={header.id}
                    style={{ width: columnWidth }}
                    className="px-4 py-5 text-center truncate"
                  >
                    <If condition={header.key === 'client'}>
                      <Then>
                        <span className="font-bold">{row.name}</span>
                      </Then>
                    </If>

                    <If condition={header.key === 'contact'}>
                      <Then>
                        <div className="flex flex-col items-center gap-1">
                          <span className="flex items-center gap-1">
                            <a
                              href={`https://wa.me/${normalizePhone(
                                row.phone
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <LiaWhatsapp />
                            </a>
                            <a href={`tel:${normalizePhone(row.phone)}`}>
                              {row.phone}
                            </a>
                          </span>

                          <a
                            href={`mailto:${row.email}`}
                            className="flex items-center gap-1"
                          >
                            <GoMail /> {row.email}
                          </a>
                        </div>
                      </Then>
                    </If>

                    <If condition={header.key === 'status'}>
                      <Then>
                        {row.status &&
                          getStatusBadge(row.status, row.statusText || '')}
                      </Then>
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

                    <If condition={header.key === 'source'}>
                      <Then>{row.source}</Then>
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
