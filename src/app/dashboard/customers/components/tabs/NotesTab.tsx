import React from 'react';
import { Else, If, Then } from 'react-if';

interface NotesTabProps {
  notes: string[];
  createdAt: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ notes, createdAt }) => {
  return (
    <div className="mt-4">
      <If condition={notes && notes.length > 0}>
        <Then>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-xl border border-gray-100"
              >
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {note}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-3 font-medium">
                  نشر في: {new Date(createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            ))}
          </div>
        </Then>
        <Else>
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm">
            لا توجد ملاحظات مسجلة لهذا العميل
          </div>
        </Else>
      </If>
    </div>
  );
};

export default NotesTab;
