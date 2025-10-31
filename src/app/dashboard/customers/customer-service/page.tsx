import React from 'react';
import SummaryCard from './SummaryCard';
import TapsCustomer from './components/TapsCustomer';
import TotalOrdersChart from './components/Charts/TotalOrdersChart';
import { CallDistributionChart } from './components/Charts/DistributionOfApplicationCases';
import StopHours from './StopHours';
import CompareBetweenEmployees from './CompareBetweenEmployees';
import CallDetails from './CallDetails';
import CompareCompare from './CompareEmployee';

function CustomerService() {
  return (
    <>
      <TapsCustomer />
      <SummaryCard />
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mt-10 w-[100%]">
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
        <TotalOrdersChart />
      </div>
      {/* <CallDistributionChart /> */}
      <CompareCompare />
      <CallDetails />
      <CompareBetweenEmployees />
      <StopHours />
    </>
  );
}

export default CustomerService;
