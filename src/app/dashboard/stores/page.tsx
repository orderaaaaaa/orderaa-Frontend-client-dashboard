'use client';

import React, { useCallback, useState } from 'react';
import StoresHeader from './components/StoresHeader';
import StoreStates from './components/StoreStates';
import StoresFilters from './components/StoresFilters';
import StoresTable from './components/storesTable';
import { STORES_SAMPLE_DATA } from './constants/storesTable';

function StoresPage() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState('');

  const handleFromDateChange = useCallback((date: Date | null) => {
    setFromDate(date);
  }, []);

  const handleToDateChange = useCallback((date: Date | null) => {
    setToDate(date);
  }, []);

  const handleTimePeriodChange = useCallback((period: string) => {
    setTimePeriod(period);
  }, []);

  return (
    <div className="md:p-8">
      <StoresHeader
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onTimePeriodChange={handleTimePeriodChange}
      />
      <StoreStates />
      <StoresFilters />
      <StoresTable data={STORES_SAMPLE_DATA} />
    </div>
  );
}

export default StoresPage;
