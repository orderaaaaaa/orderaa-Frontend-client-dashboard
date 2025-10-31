import React from 'react';
import SummaryCard from './components/SummaryCard';
import TapsCustomer from './components/TapsCustomer';
import TotalOrdersChart from './components/Charts/TotalOrdersChart';
import CallDistributionChart from './components/Charts/DistributionOfApplicationCases';
import StopHours from './StopHours';
import CompareBetweenEmployees from './CompareBetweenEmployees';
import CallDetails from './CallDetails';
import CompareCompare from './CompareEmployee';
import SuccessfulCallDates from './components/Charts/SuccessfulCallDatesChart';
import SuccessfulCallTime from './components/Charts/SuccessCallesTimeChart';
import OrdersDone from './components/Charts/OrdersDone';
import ConfirmationAttempts from './components/Charts/ConfirmationAttemptsCart';
import BestEmployeesChart from './components/Charts/BestEmployeesChart';
import EgyptMapSection from './EgyptMapSection';
import AverageCallDurationChart from './components/Charts/AverageCallDurationChart';
import DistributingCallsToConfirmOrders from './components/Charts/DistributingCallsToConfirmOrders';

function CustomerService() {
  return (
    <>
      <TapsCustomer />
      <SummaryCard />
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mt-10 w-[90%]">
        <CallDistributionChart />
        <TotalOrdersChart />
        <SuccessfulCallDates />
        <SuccessfulCallTime />
        <ConfirmationAttempts />
        <OrdersDone />
        <AverageCallDurationChart />
        <DistributingCallsToConfirmOrders />
      </div>
      {/* <BestEmployeesChart /> */}
      <CompareCompare />
      <CallDetails />
      <CompareBetweenEmployees />
      <StopHours />
      <EgyptMapSection />
    </>
  );
}

export default CustomerService;
