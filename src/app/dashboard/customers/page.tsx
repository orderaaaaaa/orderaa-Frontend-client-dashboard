'use client';

import React, { useState, useCallback, useMemo } from 'react';
import CustomerHeader from './components/CustomerHeader';
import CustomerStates from './components/CustomerStates';
import CustomerSearch from './components/CustomerSearch';
import CustomerTable from './components/CustomerTable';

export default function CustomersPage() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientStatus, setClientStatus] = useState<string | undefined>(
    undefined
  );
  const [orderStatus, setOrderStatus] = useState<string | undefined>(undefined);

  const handleFromDateChange = useCallback((date: Date | null) => {
    setFromDate(date);
  }, []);

  const handleToDateChange = useCallback((date: Date | null) => {
    setToDate(date);
  }, []);

  const handleTimePeriodChange = useCallback((period: string) => {
    setTimePeriod(period);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleClientStatusChange = useCallback((status: string) => {
    setClientStatus(status === '' ? undefined : status);
  }, []);

  const handleOrderStatusChange = useCallback((status: string) => {
    setOrderStatus(status === '' || status === 'all' ? undefined : status);
  }, []);

  return (
    <div className="mx-auto">
      <CustomerHeader
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onTimePeriodChange={handleTimePeriodChange}
      />
      <CustomerStates />
      <CustomerSearch
        fromDate={fromDate}
        toDate={toDate}
        timePeriod={timePeriod}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onTimePeriodChange={handleTimePeriodChange}
        onSearchChange={handleSearchChange}
        onClientStatusChange={handleClientStatusChange}
        onOrderStatusChange={handleOrderStatusChange}
      />
      <CustomerTable
        searchTerm={searchTerm}
        clientStatus={clientStatus}
        orderStatus={orderStatus}
      />
    </div>
  );
}
