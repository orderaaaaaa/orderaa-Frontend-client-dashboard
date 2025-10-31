import React from 'react';
import { TABLE_DATA } from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './components/Table';

function CompareBetweenEmployees() {
  return (
    <Table data={TABLE_DATA} type={false} name=" تفاصيل مقارنة بين موظفين " />
  );
}

export default CompareBetweenEmployees;
