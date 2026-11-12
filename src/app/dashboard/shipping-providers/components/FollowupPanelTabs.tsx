'use client';

import { History, MessageSquareText } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { UnreadNotesCountPill } from './FollowupNotesUnreadBadge';
import {
  FOLLOWUP_EVENTS_TAB_LABEL,
  FOLLOWUP_NOTES_TAB_LABEL,
  FOLLOWUP_TABS_LABEL,
} from './followupNotesConstants';
import { FOLLOWUP_PANELS } from './followupPanels';

const TRIGGER_CLASS = 'group min-h-10 gap-1.5 text-muted-foreground hover:text-foreground';

const ACTIVE_PILL_CLASS = cn(
  'group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-primary',
  'dark:group-data-[state=active]:bg-primary-foreground dark:group-data-[state=active]:text-primary'
);

export function FollowupPanelTabs({ unreadNotes }: { unreadNotes: number }) {
  return (
    <TabsList aria-label={FOLLOWUP_TABS_LABEL} className="w-full bg-muted">
      <TabsTrigger
        value={FOLLOWUP_PANELS.NOTES}
        className={TRIGGER_CLASS}
        aria-label={
          unreadNotes > 0 ? `${FOLLOWUP_NOTES_TAB_LABEL}، ${unreadNotes} غير مقروءة` : FOLLOWUP_NOTES_TAB_LABEL
        }
      >
        <MessageSquareText className="size-4" aria-hidden="true" />
        <span>{FOLLOWUP_NOTES_TAB_LABEL}</span>
        <UnreadNotesCountPill count={unreadNotes} className={ACTIVE_PILL_CLASS} />
      </TabsTrigger>
      <TabsTrigger value={FOLLOWUP_PANELS.EVENTS} className={TRIGGER_CLASS}>
        <History className="size-4" aria-hidden="true" />
        <span>{FOLLOWUP_EVENTS_TAB_LABEL}</span>
      </TabsTrigger>
    </TabsList>
  );
}
