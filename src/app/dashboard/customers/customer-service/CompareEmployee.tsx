import AreaChartComponent from './components/Charts/CompareEmployee';

export const MOCK_EMPLOYEE_STATS = [
  {
    id: 1,
    name: 'يوستينا',
    totalCalls: 156,
    confirmedCalls: 115,
    breakDuration: '40 دقيقة',
    workHours: '9 ساعات',
  },
  {
    id: 2,
    name: 'سارة خالد',
    totalCalls: 142,
    confirmedCalls: 98,
    breakDuration: '35 دقيقة',
    workHours: '8 ساعات',
  },
  {
    id: 3,
    name: 'ليان محمد',
    totalCalls: 178,
    confirmedCalls: 125,
    breakDuration: '45 دقيقة',
    workHours: '9 ساعات',
  },
];

function CompareEmployees() {
  return (
    <div className="w-full flex flex-col xl:flex-row justify-between items-stretch gap-8 p-6 bg-white rounded-2xl shadow-xl mt-10">
      {/* Employee Stats Section */}
      <div className="w-full xl:w-[30%] flex flex-col justify-between">
        <h2 className="text-xl font-bold mb-4 text-right">مقارنة الموظفين</h2>
        <div className="flex flex-col gap-4 h-full">
          {MOCK_EMPLOYEE_STATS.map((employee) => (
            <div
              key={employee.id}
              className="border-2 border-[#5D24E1] rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col justify-center"
            >
              <h3 className="text-xl font-semibold mb-3 text-right">
                {employee.name}
              </h3>
              <div className="grid grid-cols-2 text-right gap-2">
                <p className="text-[15px]">
                  إجمالي المكالمات المؤكدة: {employee.confirmedCalls}
                </p>
                <p className="text-[15px]">
                  إجمالي المكالمات: {employee.totalCalls}
                </p>
                <p className="text-[15px]">
                  مدة التوقف: {employee.breakDuration}
                </p>
                <p className="text-[15px]">ساعات العمل: {employee.workHours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full xl:w-[70%] flex items-center justify-center">
        <div className="rounded-xl p-4 w-full h-full xl:max-h-[500px] flex items-center justify-center">
          <AreaChartComponent />
        </div>
      </div>
    </div>
  );
}

export default CompareEmployees;
