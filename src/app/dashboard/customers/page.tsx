'use client';

import React, { useState } from 'react';
import CustomerHeader from './components/CustomerHeader';
import CustomerStates from './components/CustomerStates';

export default function CustomersPage() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState('');

  return (
    <div className="mx-auto">
      <CustomerHeader
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onTimePeriodChange={setTimePeriod}
      />
      <CustomerStates />
    </div>
  );
}
