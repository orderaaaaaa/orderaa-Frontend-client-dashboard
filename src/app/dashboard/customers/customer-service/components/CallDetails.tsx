import React from 'react';
import { TABLE_DATA } from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './Table';
import { Plus } from 'lucide-react';

function CallDetails() {
  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-xl mt-10 items-stretch">
        <h2 className="text-xl font-bold mb-5 text-right border-b-2 pb-4">
          تفاصيل المكالمات لكل موظف{' '}
        </h2>
        <Table data={TABLE_DATA} type={true} />{' '}
      </div>
    </>
  );
}

export default CallDetails;
