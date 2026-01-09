import React from 'react';
import LeadsHeader from './components/LeadsHeader';
import LeadsStatsCards from './components/LeadsStatsCards';
import LeadsList from './components/LeadsList';

function LeadsPage() {
  return (
    <div className="md:p-6">
      <LeadsHeader />
      <LeadsStatsCards />
      <LeadsList />
    </div>
  );
}

export default LeadsPage;
