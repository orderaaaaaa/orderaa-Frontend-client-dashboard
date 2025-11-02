'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SummaryCard from './components/SummaryCard';
import TapsCustomer from './components/TapsCustomer';
import TotalOrdersChart from './components/Charts/TotalOrdersChart';
import CallDistributionChart from './components/Charts/DistributionOfApplicationCases';
import StopHours from './components/StopHours';
import CompareBetweenEmployees from './components/CompareBetweenEmployees';
import CallDetails from './components/CallDetails';
import CompareCompare from './components/CompareEmployee';
import SuccessfulCallDates from './components/Charts/SuccessfulCallDatesChart';
import SuccessCallesTimeChartMorning from './components/Charts/SuccessCallesTimeChartMorning';
import SuccessCallesTimeChartEvening from './components/Charts/SuccessCallesTimeChartEvening';
import SuccessCallesTimeChartMidLevel from './components/Charts/SuccessCallesTimeChartMidLevel';
import OrdersDone from './components/Charts/OrdersDone';
import ConfirmationAttempts from './components/Charts/ConfirmationAttemptsCart';
import BestEmployeesChart from './components/Charts/BestEmployeesChart';
import EgyptMapSection from './components/EgyptMapSection';
import AverageCallDurationChart from './components/Charts/AverageCallDurationChart';
import DistributingCallsToConfirmOrders from './components/Charts/DistributingCallsToConfirmOrders';
import EmployeePerformance from './components/EmployeePerformance';

function CustomerService() {
  return (
    <>
      <TapsCustomer />
      <SummaryCard />
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mt-10 smw-[90%]">
        <CallDistributionChart />
        <TotalOrdersChart />
        <SuccessfulCallDates />
        <div className="relative bg-white rounded-2xl pb-6 shadow-xl max-w-3xl">
          <Swiper
            modules={[Pagination]}
            pagination={{
              clickable: true,
              bulletActiveClass: 'swiper-pagination-bullet-active-custom',
              bulletClass: 'swiper-pagination-bullet-custom',
            }}
            className="success-calls-time-swiper"
          >
            <SwiperSlide>
              <SuccessCallesTimeChartMorning />
            </SwiperSlide>
            <SwiperSlide>
              <SuccessCallesTimeChartEvening />
            </SwiperSlide>
            <SwiperSlide>
              <SuccessCallesTimeChartMidLevel />
            </SwiperSlide>
          </Swiper>
        </div>
        <ConfirmationAttempts />
        <OrdersDone />
        <AverageCallDurationChart />
        <DistributingCallsToConfirmOrders />
      </div>
      <EmployeePerformance />
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
