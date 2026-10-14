'use client';

import React from 'react';
import { InvoiceProps } from '../types/invoice';
import { Invoice } from './Invoice';
import { BostaInvoice } from './BostaInvoice';

export function InvoiceRenderer(props: InvoiceProps) {
  if (props.data.shippingCompanyCode === 'BOSTA') {
    return <BostaInvoice {...props} />;
  }
  return <Invoice {...props} />;
}
