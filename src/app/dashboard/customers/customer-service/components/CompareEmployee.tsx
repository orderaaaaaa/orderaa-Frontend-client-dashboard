import { Plus } from 'lucide-react';
import AreaChartComponent from './Charts/CompareEmployee';
import { MOCK_EMPLOYEE_STATS } from '../constants/CompareEmployeeConst';

function CompareEmployees() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl mt-10 items-stretch">
      <h2 className="text-xl font-bold mb-5 text-right border-b-2 pb-4">
        مقارنة الموظفين
      </h2>
      <div className="flex items-center gap-2 justify-end mb-8">
        <h3>الموظفين:</h3>
        <div className="flex gap-2 border-2 py-2 px-3 rounded-md">
          <p className="flex px-2 gap-1 bg-[#f2edfd] border-2 border-[#dacdf9] rounded-sm cursor-pointer">
            <Plus className="w-4" /> إضافة
          </p>
          <p className="rounded-sm bg-[#f2edfd] px-3 text-center">يوستينا</p>
          <p className="rounded-sm bg-[#f2edfd] px-3 text-center"> ندي</p>
        </div>
      </div>
      <div className="w-full flex flex-col xl:flex-row justify-between gap-8 ">
        {/* Employee Stats Section */}
        <div className="w-full xl:w-[30%] flex flex-col justify-between">
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
                  <p className="text-[15px]">
                    ساعات العمل: {employee.workHours}
                  </p>
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
    </div>
  );
}

export default CompareEmployees;
