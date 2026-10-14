'use client';

import React from 'react';
import { InvoiceProps } from '../types/invoice';
import { Invoice } from './Invoice';
import { BostaInvoice } from './BostaInvoice';
import { TurboInvoice } from './TurboInvoice';
import { JtExpressInvoice } from './JtExpressInvoice';

export function InvoiceRenderer(props: InvoiceProps) {
  if (props.data.shippingCompanyCode === 'BOSTA') {
    return <BostaInvoice {...props} />;
  }
  if (props.data.shippingCompanyCode === 'TURBO') {
    return <TurboInvoice {...props} />;
  }
  if (props.data.shippingCompanyCode === 'JT_EXPRESS') {
    return <JtExpressInvoice {...props} />;
  }
  return <Invoice {...props} />;
}
