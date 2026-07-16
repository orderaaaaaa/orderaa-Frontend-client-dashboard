'use client';
import React, { useCallback, useState } from 'react';
import EmployeePerformanceHeader from './components/EmployeePerformanceHeader';
import TapsCustomer from '../components/TapsCustomer';
import SummaryCard from '../components/SummaryCard';
import CallDetails from './components/CallDetails';
import CompareBetweenEmployees from './components/CompareBetweenEmployees';
import EgyptMapSection from './components/EgyptMapSection';
import CompareEmployees from './components/CompareEmployee';

function Page() {
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
    <div className="p-6">
      <EmployeePerformanceHeader
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onTimePeriodChange={handleTimePeriodChange}
      />
      <TapsCustomer />
      <SummaryCard />
      <CompareEmployees />
      <CallDetails />
      <CompareBetweenEmployees />
      <EgyptMapSection />
    </div>
  );
}

export default Page;
