'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CircleHelp, ListChecks, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyPanel } from '@/components/entity-manager/StateViews';
import { useOverflowFade } from '@/components/entity-manager/useOverflowFade';
import { cn } from '@/lib/utils';
import { useHasPermission } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import {
  CANONICAL_DOMAIN_CONFIGS,
  CANONICAL_NAV_DOMAINS,
  type CanonicalDomainConfig,
} from '../config/domainConfigs';

interface ShellActionProps {
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export interface EntityManagerShellProps {
  config: CanonicalDomainConfig;
  loading?: boolean;
  accessDenied?: boolean;
  announcement?: string;
  statusStrip?: ReactNode;
  primaryAction?: ShellActionProps;
  review?: { onClick: () => void };
  refresh?: ShellActionProps;
  onOpenShortcuts: () => void;
  children?: ReactNode;
}

function DisabledReason({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <span id={id} className="text-xs text-muted-foreground">
      {text}
    </span>
  );
}

export function EntityManagerShell({
  config,
  loading = false,
  accessDenied = false,
  announcement,
  statusStrip,
  primaryAction,
  review,
  refresh,
  onOpenShortcuts,
  children,
}: EntityManagerShellProps) {
  const { t } = useI18n();
  const canManage = useHasPermission(config.permissions.manage);
  const refreshReasonId = useId();
  const createReasonId = useId();
  const refreshReason = refresh?.disabled ? refresh.disabledReason : undefined;
  const createReason = primaryAction?.disabled ? primaryAction.disabledReason : undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const navOverflow = useOverflowFade(navRef);

  const pick = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  const actionsList = (phone: boolean) => (
    <>
      {canManage && config.actions.suggest && review && (
        <Button
          type="button"
          variant="outline"
          onClick={pick(review.onClick)}
          className={cn(phone && 'min-h-11 w-full justify-start')}
        >
          <ListChecks aria-hidden="true" />
          {t('canonical.shell.review')}
        </Button>
      )}
      {canManage && config.actions.refresh && refresh && (
        <div className={cn(phone ? 'flex flex-col gap-1' : 'flex items-center gap-2')}>
          <Button
            type="button"
            variant="outline"
            onClick={pick(refresh.onClick)}
            disabled={refresh.disabled}
            aria-describedby={refreshReason ? refreshReasonId : undefined}
            className={cn(phone && 'min-h-11 w-full justify-start')}
          >
            <RefreshCw aria-hidden="true" />
            {t('canonical.shell.refresh')}
          </Button>
          <DisabledReason id={refreshReasonId} text={refreshReason} />
        </div>
      )}
      {canManage && config.showCreate && primaryAction && (
        <div className={cn(phone ? 'flex flex-col gap-1' : 'flex items-center gap-2')}>
          <Button
            type="button"
            onClick={pick(primaryAction.onClick)}
            disabled={primaryAction.disabled}
            aria-describedby={createReason ? createReasonId : undefined}
            className={cn(phone && 'min-h-11 w-full justify-start')}
          >
            <Plus aria-hidden="true" />
            {t('canonical.shell.createName')}
          </Button>
          <DisabledReason id={createReasonId} text={createReason} />
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size={phone ? 'default' : 'icon'}
        aria-label={t('canonical.shell.shortcuts')}
        title={t('canonical.shell.shortcuts')}
        onClick={pick(onOpenShortcuts)}
        className={cn(phone && 'min-h-11 w-full justify-start')}
      >
        <CircleHelp aria-hidden="true" />
        {phone && t('canonical.shell.shortcuts')}
      </Button>
    </>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden sm:px-8 py-4 flex flex-col gap-5">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement ?? ''}
      </p>

      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm text-muted-foreground">{t('canonical.shell.moduleName')}</p>
            {loading ? (
              <Skeleton className="h-9 w-56 max-w-full bg-muted" />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">
                {t(config.labels.title)}
              </h1>
            )}
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {actionsList(false)}
          </div>
          <div className="sm:hidden">
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="min-h-11 w-full justify-start">
                  <MoreHorizontal aria-hidden="true" />
                  {t('canonical.shell.actions')}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 p-2">
                {actionsList(true)}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <nav aria-label={t('canonical.shell.moduleName')} className="relative">
          <div ref={navRef} className="overflow-x-auto">
          <ul className="flex w-max min-w-full flex-nowrap gap-2 sm:w-auto sm:flex-wrap">
            {CANONICAL_NAV_DOMAINS.map((domain) => {
              const item = CANONICAL_DOMAIN_CONFIGS[domain];
              const active = item.domain === config.domain;
              return (
                <li key={item.domain}>
                  <Link
                    href={`/dashboard/canonical-names/${item.route}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center whitespace-nowrap rounded-md border px-3 py-1.5 text-sm sm:min-h-0',
                      active
                        ? 'border-primary bg-primary/5 font-semibold text-primary-text'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    {t(item.labels.title)}
                  </Link>
                </li>
              );
            })}
          </ul>
          </div>
          <ScrollEndFade visible={navOverflow} />
        </nav>

        {!canManage && !accessDenied && (
          <p className="rounded-md border bg-muted/40 p-3 text-sm text-foreground">
            {t('canonical.shell.readOnly')}
          </p>
        )}

        {statusStrip}
      </header>

      {accessDenied ? <EmptyPanel variant="no-access" /> : children}
    </div>
  );
}
