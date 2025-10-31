'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
interface EmployeeData {
  label: string;
  بوستينا: number;
  سارة: number;
  ليان: number;
}

function SuccessfulCallDates() {
  const employeeData: EmployeeData[] = [
    { label: 'الجمعة', بوستينا: 40, سارة: 95, ليان: 78 },
    { label: 'الخميس', بوستينا: 99, سارة: 58, ليان: 10 },
    { label: 'الاربعاء', بوستينا: 82, سارة: 33, ليان: 60 },
    { label: 'الثلاثاء', بوستينا: 15, سارة: 90, ليان: 20 },
    { label: 'الاثنين', بوستينا: 68, سارة: 20, ليان: 97 },
    { label: 'الاحد', بوستينا: 30, سارة: 76, ليان: 30 },
    { label: 'السبت', بوستينا: 95, سارة: 42, ليان: 30 },
  ];

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">اجمالي الطلبات</h3>
      </div>

      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer
          width="100%"
          maxHeight={320}
          minWidth={370}
          minHeight={350}
        >
          <AreaChart
            data={employeeData}
            margin={{ top: 10, right: 30, left: -30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="5" />
            <defs>
              <linearGradient id="colorليان" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33147B" />
                <stop offset="100%" stopColor="#5D24E1" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              padding={{ left: 50, right: 50 }} // Add padding to start and end
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 12, dx: -20 }}
            />
            <Tooltip />

            <Area
              dataKey="بوستينا"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#C3A9FF"
              fillOpacity={1}
              name="بوستينا"
            />
            <Area
              dataKey="سارة"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#A078FC"
              fillOpacity={1}
              name="سارة"
            />
            <Area
              dataKey="ليان"
              stroke="#CBB5FD"
              strokeWidth={1}
              fill="url(#colorليان)"
              fillOpacity={1}
              name="ليان"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SuccessfulCallDates;
