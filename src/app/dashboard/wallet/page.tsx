import React from 'react';
import WalletHeader from './components/WalletHeader';
import WalletPricing from './components/WalletPricing';
import WalletTransactionLog from './components/WalletTransactionLog';

function Wallet() {
  return (
    <div className="px-7 py-5">
      <WalletHeader />
      <WalletPricing />
      <WalletTransactionLog />
    </div>
  );
}

export default Wallet;
