import React from 'react';
import PersonalData from './components/PersonalData';
import AccountSecurity from './components/AccountSecurity';

function Settings() {
  return (
    <div className="p-8 mx-auto">
      <h1 className="font-bold text-3xl mb-6">إعدادات الموظف</h1>
      <div className="flex flex-col gap-6">
        <PersonalData />
        <AccountSecurity />
      </div>
    </div>
  );
}

export default Settings;
