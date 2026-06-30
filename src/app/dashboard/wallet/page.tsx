'use client';

import { useState } from 'react';
import WalletHeader from './components/WalletHeader';
import WalletPricing from './components/WalletPricing';
import WalletTransactionLog from './components/WalletTransactionLog';
import ChargeModal from './components/ChargeModal';

function Wallet() {
  const [chargeModalOpen, setChargeModalOpen] = useState(false);

  return (
    <div className="px-3 sm:px-7 py-5">
      <WalletHeader onOpenCharge={() => setChargeModalOpen(true)} />
      <WalletPricing />
      <WalletTransactionLog />
      <ChargeModal open={chargeModalOpen} onOpenChange={setChargeModalOpen} />
    </div>
  );
}

export default Wallet;