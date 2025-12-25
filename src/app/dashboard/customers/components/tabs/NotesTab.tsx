import React from 'react';
import { Else, If, Then } from 'react-if';

interface NotesTabProps {
  notes: string[];
  createdAt: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ notes, createdAt }) => {
  return (
    <div className="mt-6">
      <If condition={notes.length}>
        <Then>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{note}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            ))}
          </div>
        </Then>
        <Else>
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            لا توجد ملاحظات
          </div>
        </Else>
      </If>
      <div></div>
    </div>
  );
};

export default NotesTab;
