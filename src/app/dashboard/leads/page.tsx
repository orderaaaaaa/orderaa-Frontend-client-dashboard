'use client';

import React from 'react';
import LeadsHeader from './components/LeadsHeader';
import LeadsStatsCards from './components/LeadsStatsCards';
import LeadsList from './components/LeadsList';
import TodaysFollowups from './components/TodaysFollowups';
import LeadsSearch from './components/LeadsSearch';
import LeadsTable from './components/LeadsTable';
import { LEADS_TABLE_DATA } from './constants/leadsDummyData';

function LeadsPage() {
  const handleSearchChange = (search: string) => {
    console.log('Search:', search);
  };

  const handleLeadTypeChange = (type: string) => {
    console.log('Lead Type:', type);
  };

  const handleLeadSourceChange = (source: string) => {
    console.log('Lead Source:', source);
  };
  return (
    <div className="md:p-6">
      <LeadsHeader />
      <LeadsStatsCards />
      <LeadsList />
      <TodaysFollowups />
      <LeadsSearch
        onSearchChange={handleSearchChange}
        onLeadTypeChange={handleLeadTypeChange}
        onLeadSourceChange={handleLeadSourceChange}
      />
      <LeadsTable data={LEADS_TABLE_DATA} />
    </div>
  );
}

export default LeadsPage;
