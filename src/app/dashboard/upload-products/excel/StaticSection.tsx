import React from 'react';
// Instructions data - can be moved to a separate file or config
const INSTRUCTIONS_DATA = {
  container: {
    className: 'bg-gray-50 px-6 flex items-center justify-center',
    dir: 'rtl',
  },
  card: {
    className:
      'w-full bg-[#CCCCCC29] border border-[#CCCCCCCC] rounded-xl max-sm:py-3 p-8 shadow-sm',
  },
  title: {
    text: 'تعليمات مهمة',
    className:
      'text-xl font-semibold text-[24px] text-gray-900 mb-6 text-right',
  },
  instructions: [
    'قم بتمرير الملفات وإفلاتها في نطاق ملفات وفقًا لصيغة الملف.',
    'الملفات يجب أن تكون بصيغة PDF أو Word فقط',
    'الحجم الأقصى للملف هو 10 ميجابايت',
    'يمكنك رفع حتى 5 ملفات في المرة الواحدة',
  ],
};
// Omar TODO: Make it DRY

const StaticSection = ({ data = INSTRUCTIONS_DATA }) => {
  const { container, card, title, instructions } = data;

  return (
    <div className={container.className} dir={container.dir}>
      <div className={card.className}>
        <h3 className={title.className}>{title.text}</h3>
        <ul className="list-disc list-inside space-y-4 text-gray-600 font-normal leading-relaxed">
          {instructions.map((instruction, index) => (
            <li key={index} className="font-base text-lg">
              {instruction}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaticSection;
