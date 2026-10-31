'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LiaAngleDownSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddFollowupNoteMutation } from '@/services/followup';
import type {
  FollowupCarrierContact,
  FollowupCarrierText,
  FollowupLegacyNote,
  FollowupNoteDay,
  FollowupNotePartyValue,
  FollowupNoteView,
} from '@/lib/api/followup';
import { formatDate, formatDateTime } from '@/utils/format';
import { FollowupNoteItem } from './FollowupNoteItem';
import { NOTE_BODY_CLASS, NoteCard } from './NoteCard';
import {
  FOLLOWUP_CARRIER_CONTACTS_LABEL,
  FOLLOWUP_CARRIER_REPEAT_PREFIX,
  FOLLOWUP_CARRIER_TEXTS_LABEL,
  FOLLOWUP_LEGACY_NAME_LABELS,
  FOLLOWUP_LEGACY_TAG,
  FOLLOWUP_NOTE_ADD_LABEL,
  FOLLOWUP_NOTE_ADD_PLACEHOLDER,
  FOLLOWUP_NOTE_MAX_LENGTH,
  FOLLOWUP_NOTE_NO_WRITER,
  FOLLOWUP_NOTE_PARTY_LABELS,
  FOLLOWUP_NOTE_PARTY_ORDER,
  FOLLOWUP_NOTES_EMPTY_DAY,
  FOLLOWUP_TODAY_LABEL,
} from './followupNotesConstants';

const formatDayKey = (key: string): string => {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6));
  const dayOfMonth = Number(key.slice(6, 8));
  return formatDate(new Date(Date.UTC(year, month - 1, dayOfMonth, 12)));
};

const repeatsSuffix = (repeats: number): string =>
  repeats > 1 ? ` ${FOLLOWUP_CARRIER_REPEAT_PREFIX}${repeats}` : '';

function CarrierTextList({ texts }: { texts: FollowupCarrierText[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {texts.map((line) => (
        <li key={`${line.at}-${line.text}`} className="break-words text-base leading-7 text-foreground">
          <span className="text-xs text-muted-foreground">{formatDateTime(line.at)}</span> {line.text}
          {repeatsSuffix(line.repeats)}
        </li>
      ))}
    </ul>
  );
}

function CarrierContactList({ contacts }: { contacts: FollowupCarrierContact[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {contacts.map((contact) => (
        <li key={`${contact.at}-${contact.name}-${contact.phone}`} className="break-words text-sm text-foreground">
          <span className="text-xs text-muted-foreground">{formatDateTime(contact.at)}</span>{' '}
          {contact.name ?? FOLLOWUP_NOTE_NO_WRITER}
          {contact.phone && (
            <span dir="ltr" className="font-mono">
              {' '}
              {contact.phone}
            </span>
          )}
          {repeatsSuffix(contact.repeats)}
        </li>
      ))}
    </ul>
  );
}

function PartySection({
  party,
  notes,
  orderId,
  canManage,
  carrierTexts,
  carrierContacts,
}: {
  party: FollowupNotePartyValue;
  notes: FollowupNoteView[];
  orderId: number;
  canManage: boolean;
  carrierTexts: FollowupCarrierText[];
  carrierContacts: FollowupCarrierContact[];
}) {
  const showTexts = party !== 'CUSTOMER' && carrierTexts.length > 0;
  const showContacts = party === 'COURIER' && carrierContacts.length > 0;

  return (
    <section className="flex flex-col gap-2 min-w-0">
      <h4 className="text-sm font-semibold text-foreground">{FOLLOWUP_NOTE_PARTY_LABELS[party]}</h4>
      {notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <FollowupNoteItem key={note.id} orderId={orderId} note={note} canManage={canManage} />
          ))}
        </ul>
      )}
      {showTexts && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{FOLLOWUP_CARRIER_TEXTS_LABEL}</span>
          <CarrierTextList texts={carrierTexts} />
        </div>
      )}
      {showContacts && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{FOLLOWUP_CARRIER_CONTACTS_LABEL}</span>
          <CarrierContactList contacts={carrierContacts} />
        </div>
      )}
    </section>
  );
}

function LegacyNoteList({ legacyNotes }: { legacyNotes: FollowupLegacyNote[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {legacyNotes.map((legacy) => (
        <NoteCard
          key={legacy.id}
          variant="legacy"
          meta={
            <>
              <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                {FOLLOWUP_LEGACY_TAG}
              </span>
              <span>{FOLLOWUP_LEGACY_NAME_LABELS[legacy.name] ?? legacy.name}</span>
              <span>
                {legacy.employeeName ?? FOLLOWUP_NOTE_NO_WRITER} - {formatDateTime(legacy.createdAt)}
              </span>
            </>
          }
        >
          <p className={NOTE_BODY_CLASS}>{legacy.note}</p>
        </NoteCard>
      ))}
    </ul>
  );
}

function AddFollowupNoteForm({ orderId }: { orderId: number }) {
  const [party, setParty] = useState<FollowupNotePartyValue>('CUSTOMER');
  const [body, setBody] = useState('');
  const addMutation = useAddFollowupNoteMutation();
  const trimmedBody = body.trim();

  const submit = () => {
    addMutation.mutate({ orderId, party, body: trimmedBody }, { onSuccess: () => setBody('') });
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex flex-wrap gap-1.5">
        {FOLLOWUP_NOTE_PARTY_ORDER.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={party === value ? 'default' : 'outline'}
            aria-pressed={party === value}
            className="h-7 px-3 text-xs"
            onClick={() => setParty(value)}
          >
            {FOLLOWUP_NOTE_PARTY_LABELS[value]}
          </Button>
        ))}
      </div>
      <Textarea
        name={`followup-note-add-${orderId}`}
        value={body}
        placeholder={FOLLOWUP_NOTE_ADD_PLACEHOLDER}
        maxLength={FOLLOWUP_NOTE_MAX_LENGTH}
        rows={2}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          loading={addMutation.isPending}
          disabled={trimmedBody.length === 0 || addMutation.isPending}
          onClick={submit}
        >
          {FOLLOWUP_NOTE_ADD_LABEL}
        </Button>
      </div>
    </div>
  );
}

interface FollowupNoteDayCardProps {
  orderId: number;
  day: FollowupNoteDay;
  canManage: boolean;
}

export function FollowupNoteDayCard({ orderId, day, canManage }: FollowupNoteDayCardProps) {
  const [isOpen, setIsOpen] = useState(day.isToday);
  const hasContent =
    day.notes.length > 0 ||
    day.legacyNotes.length > 0 ||
    day.carrier.texts.length > 0 ||
    day.carrier.contacts.length > 0;
  const headerLabel = day.isToday ? `${FOLLOWUP_TODAY_LABEL} - ${formatDayKey(day.day)}` : formatDayKey(day.day);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start"
      >
        <span className="text-xs font-medium text-muted-foreground">{headerLabel}</span>
        <LiaAngleDownSolid
          className={clsx('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 border-t border-border p-3">
          {!hasContent && <p className="text-sm text-muted-foreground text-center">{FOLLOWUP_NOTES_EMPTY_DAY}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FOLLOWUP_NOTE_PARTY_ORDER.map((party) => (
              <PartySection
                key={party}
                party={party}
                notes={day.notes.filter((note) => note.party === party)}
                orderId={orderId}
                canManage={canManage}
                carrierTexts={day.carrier.texts}
                carrierContacts={day.carrier.contacts}
              />
            ))}
          </div>

          {day.legacyNotes.length > 0 && <LegacyNoteList legacyNotes={day.legacyNotes} />}

          {day.canAddNotes && canManage && <AddFollowupNoteForm orderId={orderId} />}
        </div>
      )}
    </div>
  );
}
