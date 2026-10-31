'use client';

import React, { useState } from 'react';
import CustomerPicker from '@/components/customers/CustomerPicker';
import { useI18n } from '@/i18n/I18nProvider';
import type { Customer } from '@/app/dashboard/customers/types/customer';

function CustomerReturnForm() {
  const { t } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);

  return (
    <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="flex w-full flex-col gap-4 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px]">{t('customerReturn.customer.label')}</h1>
        <CustomerPicker id="return-customer" value={customer} onChange={setCustomer} />
      </div>
    </div>
  );
}

export default CustomerReturnForm;
