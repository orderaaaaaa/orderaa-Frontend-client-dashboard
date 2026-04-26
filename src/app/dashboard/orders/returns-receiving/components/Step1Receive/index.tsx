'use client';

import { useEffect, useRef, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { MainScanPanel } from './MainScanPanel';
import { ProofUploadPanel } from './ProofUploadPanel';

type PanelKey = 'main' | 'proof';

interface Step1ReceiveProps {
  onValidityChange: (valid: boolean) => void;
}

const normalize = (code: string) => code.trim().toUpperCase();

export function Step1Receive({ onValidityChange }: Step1ReceiveProps) {
  const mainScanInputRef = useRef<HTMLInputElement | null>(null);

  const [expectedCount, setExpectedCount] = useState<number | null>(null);
  const [mainScanCodes, setMainScanCodes] = useState<string[]>([]);
  const [mainPanelLocked, setMainPanelLocked] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);

  const proofEnabled = mainPanelLocked;

  const isStep1Valid =
    mainPanelLocked && receiptImage !== null && proofUploaded;

  useEffect(() => {
    onValidityChange(isStep1Valid);
  }, [isStep1Valid, onValidityChange]);

  useEffect(() => {
    if (receiptImage === null && proofUploaded) {
      setProofUploaded(false);
    }
  }, [receiptImage, proofUploaded]);

  const [expandedItems, setExpandedItems] = useState<string[]>(['main']);

  const handleComplete = (key: PanelKey) => {
    setExpandedItems((prev) => {
      let next = prev.filter((v) => v !== key);
      if (key === 'main' && !next.includes('proof')) {
        next = [...next, 'proof'];
      }
      return next;
    });
  };

  const addMainScanCode = (code: string) => {
    const n = normalize(code);
    setMainScanCodes((prev) => (prev.includes(n) ? prev : [n, ...prev]));
  };
  const removeMainScanCode = (code: string) => {
    const n = normalize(code);
    setMainScanCodes((prev) => prev.filter((c) => c !== n));
  };

  return (
    <div className="flex flex-col gap-4">
      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="flex flex-col gap-4"
      >
        <MainScanPanel
          scanInputRef={mainScanInputRef}
          onComplete={() => handleComplete('main')}
          expectedCount={expectedCount}
          setExpectedCount={setExpectedCount}
          mainScanCodes={mainScanCodes}
          addMainScanCode={addMainScanCode}
          removeMainScanCode={removeMainScanCode}
          mainPanelLocked={mainPanelLocked}
          setMainPanelLocked={setMainPanelLocked}
        />
        <ProofUploadPanel
          enabled={proofEnabled}
          onComplete={() => handleComplete('proof')}
          receiptImage={receiptImage}
          setReceiptImage={setReceiptImage}
          proofUploaded={proofUploaded}
          setProofUploaded={setProofUploaded}
        />
      </Accordion>
    </div>
  );
}
