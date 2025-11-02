import React from 'react';
import {
  COMPARE_EMPLOYEES_DATA,
  COMPARE_EMPLOYEES_HEADERS,
} from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './Table';

function CompareBetweenEmployees() {
  return (
    <Table
      data={COMPARE_EMPLOYEES_DATA}
      headers={COMPARE_EMPLOYEES_HEADERS}
      type={false}
      name=" تفاصيل مقارنة بين موظفين "
    />
  );
}

export default CompareBetweenEmployees;
