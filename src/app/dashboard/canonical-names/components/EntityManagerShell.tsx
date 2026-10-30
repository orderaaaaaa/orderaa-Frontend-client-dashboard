'use client';

import { useId, type ReactNode } from 'react';
import Link from 'next/link';
import { CircleHelp, ListChecks, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyPanel } from '@/components/entity-manager/StateViews';
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

          <div className="flex flex-wrap items-center gap-2">
            {canManage && config.actions.suggest && review && (
              <Button type="button" variant="outline" onClick={review.onClick}>
                <ListChecks aria-hidden="true" />
                {t('canonical.shell.review')}
              </Button>
            )}
            {canManage && config.actions.refresh && refresh && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={refresh.onClick}
                  disabled={refresh.disabled}
                  aria-describedby={refreshReason ? refreshReasonId : undefined}
                >
                  <RefreshCw aria-hidden="true" />
                  {t('canonical.shell.refresh')}
                </Button>
                <DisabledReason id={refreshReasonId} text={refreshReason} />
              </div>
            )}
            {canManage && config.showCreate && primaryAction && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  aria-describedby={createReason ? createReasonId : undefined}
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
              size="icon"
              aria-label={t('canonical.shell.shortcuts')}
              title={t('canonical.shell.shortcuts')}
              onClick={onOpenShortcuts}
            >
              <CircleHelp aria-hidden="true" />
            </Button>
          </div>
        </div>

        <nav aria-label={t('canonical.shell.moduleName')}>
          <ul className="flex flex-wrap gap-2">
            {CANONICAL_NAV_DOMAINS.map((domain) => {
              const item = CANONICAL_DOMAIN_CONFIGS[domain];
              const active = item.domain === config.domain;
              return (
                <li key={item.domain}>
                  <Link
                    href={`/dashboard/canonical-names/${item.route}`}
                    aria-current={active ? 'page' : undefined}
                    className={
                      active
                        ? 'inline-flex items-center rounded-md border border-primary bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary'
                        : 'inline-flex items-center rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-accent'
                    }
                  >
                    {t(item.labels.title)}
                  </Link>
                </li>
              );
            })}
          </ul>
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
