import React from 'react';
import { TABLE_DATA } from '@/constants/customer-service/CompareBetweenEmployees';
import Table from './components/Table';

function CallDetails() {
  return <Table data={TABLE_DATA} type={true} />;
}

export default CallDetails;
