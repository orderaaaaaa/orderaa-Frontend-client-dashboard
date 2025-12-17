import React from 'react';
import {
  COMPARE_EMPLOYEES_DATA,
  COMPARE_EMPLOYEES_HEADERS,
} from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './Table';
import { Plus } from 'lucide-react';

function CompareBetweenEmployees() {
  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-xl mt-10 items-stretch">
        <h2 className="text-xl font-bold mb-5 text-right border-b-2 pb-4">
          تفاصيل مقارنة بين موظفين{' '}
        </h2>
        <div className="flex items-center gap-2 justify-end ">
          <h3>الموظفين:</h3>
          <div className="flex gap-2 border-2 py-2 px-3 rounded-md">
            <p className="flex px-2 gap-1 bg-[#f2edfd] border-2 border-[#dacdf9] rounded-sm cursor-pointer">
              <Plus className="w-4" /> إضافة
            </p>
            <p className="rounded-sm bg-[#f2edfd] px-3 text-center">يوستينا</p>
            <p className="rounded-sm bg-[#f2edfd] px-3 text-center"> ندي</p>
          </div>
        </div>

        <Table
          data={COMPARE_EMPLOYEES_DATA}
          headers={COMPARE_EMPLOYEES_HEADERS}
          type={false}
        />
      </div>
    </>
  );
}

export default CompareBetweenEmployees;
