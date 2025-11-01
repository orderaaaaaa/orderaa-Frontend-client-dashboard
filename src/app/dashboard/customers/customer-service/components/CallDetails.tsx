import React from 'react';
import { TABLE_DATA } from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './Table';

function CallDetails() {
  return (
    <>
      <Table data={TABLE_DATA} type={true} name="تفاصيل المكالمات لكل موظف" />{' '}
    </>
  );
}

export default CallDetails;
