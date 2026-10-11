'use client';

import { useEffect, useRef } from 'react';
import { useLightfunnelsCleanupFlow } from '../hooks/useLightfunnelsCleanupFlow';
import LightfunnelsWebhookCleanupDialog from './LightfunnelsWebhookCleanupDialog';

interface LightfunnelsCleanupFlowProps {
  storeId: number;
  onDone: () => void;
}

export default function LightfunnelsCleanupFlow({
  storeId,
  onDone,
}: LightfunnelsCleanupFlowProps) {
  const { switchToAutomatic, dialog } = useLightfunnelsCleanupFlow(storeId, {
    onSettled: onDone,
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    switchToAutomatic();
  }, [switchToAutomatic]);

  return <LightfunnelsWebhookCleanupDialog storeId={storeId} {...dialog} />;
}
