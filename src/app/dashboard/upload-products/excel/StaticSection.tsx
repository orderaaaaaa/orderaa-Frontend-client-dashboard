import React from 'react';

const StaticSection = () => {
  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-[#CCCCCC29] border border-[#CCCCCCCC] rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-[24px] text-gray-900 mb-6 text-right">
          تعليمات مهمة
        </h3>
        <ul className="list-disc list-inside space-y-4 text-gray-600 font-normal leading-relaxed">
          <li className="font-base text-lg">
            قم بتمرير الملفات وإفلاتها في نطاق ملفات وفقًا لصيغة الملف.
          </li>
          <li className="font-base text-lg">
            قم بتمرير الملفات وإفلاتها في نطاق ملفات وفقًا لصيغة الملف.
          </li>
          <li className="font-base text-lg">
            قم بتمرير الملفات وإفلاتها في نطاق ملفات وفقًا لصيغة الملف.
          </li>
          <li className="font-base text-lg">
            قم بتمرير الملفات وإفلاتها في نطاق ملفات وفقًا لصيغة الملف.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StaticSection;
