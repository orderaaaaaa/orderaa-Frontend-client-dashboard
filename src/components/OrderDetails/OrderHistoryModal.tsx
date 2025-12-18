'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCheckCircle } from 'react-icons/lia';
import { OrderEvent } from '@/types/orders';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: OrderEvent[];
}

interface ParsedEvent {
  status: string;
  displayDate: string;
  note?: string | null;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  events,
}: OrderHistoryModalProps) {
  const parseEvents = (): ParsedEvent[] => {
    return events.map((event) => {
      const date = new Date(event.createdAt);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const displayDate = `${day}-${month}-${year}`;

      return {
        status: event.status,
        displayDate,
        note: event.note,
      };
    });
  };

  const parsedEvents = parseEvents();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="سجل الطلبات"
      showFooter={false}
      maxWidth="w-[900px]"
    >
      <div className="py-8 px-4">
        {parsedEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد أحداث لهذا الطلب
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="flex items-start gap-16 relative px-8">
              {parsedEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative min-w-[120px]"
                  style={{ zIndex: 2 }}
                >
                  {index < parsedEvents.length - 1 && (
                    <div
                      className="absolute h-[3px] bg-[#CBB5FD]"
                      style={{
                        top: '1.25rem',
                        right: '-4rem',
                        width: '8rem',
                        zIndex: 0
                      }}
                    />
                  )}

                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 border-[3px] border-[#CBB5FD] relative"
                    style={{ zIndex: 1 }}>
                    <LiaCheckCircle className="w-6 h-6 text-[#5D24E1]" />
                  </div>

                  <h3 className="text-base font-semibold text-[#1F1F1F] mb-2 text-center px-2">
                    {event.status}
                  </h3>

                  <p className="text-sm text-[#5F5E5E] text-center">
                    {event.displayDate}
                  </p>

                  {event.note && (
                    <p className="text-xs text-[#888] text-center mt-1 max-w-[100px] truncate">
                      {event.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
