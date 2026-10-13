import React from 'react';
import { LiaBanSolid } from 'react-icons/lia';
import { blockReasonOf, formatOrderDate } from '../../../lib/contact';
import { CustomersDetailsBlockHistoryProps } from '../../../types/CustomersDetailsModal';

const NO_REASON = 'بدون سبب';

export const CustomersDetailsBlockHistory = ({
  isBlocked,
  currentBlock,
  blockHistory,
  notes,
}: CustomersDetailsBlockHistoryProps) => {
  if (!isBlocked && blockHistory.length === 0) return null;

  const currentReason = blockReasonOf({ isBlocked, currentBlock, notes });
  const earlier = currentBlock ? blockHistory.slice(1) : blockHistory;

  return (
    <section
      className="mt-4 rounded-xl border border-gray-100 bg-white p-4"
      aria-label="الحظر"
    >
      {isBlocked && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <div className="flex items-center gap-2 font-bold text-[#95071f]">
            <LiaBanSolid className="h-5 w-5 shrink-0" aria-hidden />
            <span>سبب الحظر الحالي</span>
          </div>
          <p
            className="mt-2 break-words text-sm text-gray-800 md:text-base"
            data-testid="current-block-reason"
          >
            {currentReason ?? NO_REASON}
          </p>
          {currentBlock && (
            <p className="mt-2 text-xs text-gray-500">
              تاريخ الحظر: {formatOrderDate(currentBlock.blockedAt)}
              {currentBlock.blockedUntil &&
                ` · حتى: ${formatOrderDate(currentBlock.blockedUntil)}`}
            </p>
          )}
        </div>
      )}

      {earlier.length > 0 && (
        <div className={isBlocked ? 'mt-4' : ''}>
          <h3 className="mb-2 text-sm font-bold text-gray-700">
            سجل الحظر السابق
          </h3>
          <ul className="space-y-2" data-testid="block-history">
            {earlier.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="break-words text-sm text-gray-700">
                  {entry.reason || NO_REASON}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  تاريخ الحظر: {formatOrderDate(entry.createdAt)}
                  {entry.blockedUntil &&
                    ` · حتى: ${formatOrderDate(entry.blockedUntil)}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
