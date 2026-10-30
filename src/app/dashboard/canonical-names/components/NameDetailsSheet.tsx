'use client';

import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PaginationFooter from '@/components/ui/pagination-footer';
import {
  ConfirmImpactDialog,
  type ConfirmImpact,
} from '@/components/entity-manager/ConfirmImpactDialog';
import { EntitySideSheet } from '@/components/entity-manager/EntitySideSheet';
import { LinkCombobox } from '@/components/entity-manager/LinkCombobox';
import type {
  ComboGroup,
  ComboOption,
} from '@/components/entity-manager/types';
import { VisualizedSpelling } from '@/components/entity-manager/VisualizedSpelling';
import { isRowNotFoundError } from '@/app/dashboard/canonical-names/utils/linkFeedback';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import {
  deleteNameErrorMessage,
  invalidateDomainQueries,
  isLocationDomain,
  useCanonicalNamesQuery,
  useNameImpactQuery,
} from '@/services/canonicalNames';
import type {
  CanonicalName,
  CanonicalNameDomain,
  NameImpact,
  NameImpactAlias,
  SourceGroup,
} from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { getApiErrorMessage } from '@/utils/apiError';

const NAME_MAX_LENGTH = 191;
const NAME_COUNTER_AFTER = 150;
const PAGE_SIZE = 50;

const groupKey = (group: SourceGroup) =>
  `${group.scopeId}:${group.normalizedText}`;

export interface NameDetailsSheetProps {
  domain: CanonicalNameDomain;
  name: CanonicalName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  unlinkedGroups?: SourceGroup[];
  onRename: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onUnlinkAlias?: (alias: NameImpactAlias) => Promise<void>;
  onAddSynonym?: (group: SourceGroup) => Promise<void>;
}

export function NameDetailsSheet(props: NameDetailsSheetProps) {
  if (props.name === null) return null;
  return (
    <NameDetailsContent key={props.name.id} {...props} name={props.name} />
  );
}

type ConfirmMode = 'rename' | 'delete';

interface NameDetailsContentProps extends Omit<NameDetailsSheetProps, 'name'> {
  name: CanonicalName;
}

function NameDetailsContent({
  domain,
  name,
  open,
  onOpenChange,
  canManage,
  unlinkedGroups = [],
  onRename,
  onDelete,
  onUnlinkAlias,
  onAddSynonym,
}: NameDetailsContentProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmMode | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const isLocation = isLocationDomain(domain);
  const isGovernorate = domain === CANONICAL_NAME_DOMAINS.GOVERNORATE;
  const isAttribute =
    domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME ||
    domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION;
  const canEdit = canManage && !name.isSystem;

  const impactQuery = useNameImpactQuery(
    domain,
    name.id,
    { page, limit },
    open,
  );
  const citiesQuery = useCanonicalNamesQuery(
    CANONICAL_NAME_DOMAINS.CITY,
    { scopeId: name.id },
    open && isGovernorate,
  );
  const impact: NameImpact | undefined = impactQuery.data;
  const linkedCityIds = new Set(
    (citiesQuery.data ?? [])
      .filter((city) => city.rowCount > 0)
      .map((city) => city.id),
  );
  const blockedCityNames = impact
    ? impact.children
        .filter((child) => linkedCityIds.has(child.id))
        .map((child) => child.name)
    : [];

  const impactForDialog: ConfirmImpact = {
    state:
      impactQuery.isError || citiesQuery.isError
        ? 'error'
        : impact && (!isGovernorate || citiesQuery.data)
          ? 'ready'
          : 'loading',
    data: impact,
    onRetry: () => {
      void impactQuery.refetch();
      void citiesQuery.refetch();
    },
  };

  const headerDescription = isLocation
    ? t('canonical.name.header.location', {
        rows: name.rowCount,
        rowsNoun: pluralAr(t, 'location', name.rowCount),
        orders: name.orderCount,
        ordersNoun: pluralAr(t, 'order', name.orderCount),
      })
    : t('canonical.name.header.attribute', {
        rows: name.rowCount,
        rowsNoun: pluralAr(t, 'item', name.rowCount),
        products: name.productCount,
        productsNoun: pluralAr(t, 'product', name.productCount),
      });

  const synonymGroups: ComboGroup[] = [
    {
      id: 'all',
      headingKey: 'canonical.combobox.groupAll',
      status: 'ready',
      options: unlinkedGroups.map((group) => ({
        id: groupKey(group),
        label: group.spellings[0]?.text ?? group.normalizedText,
        target: { kind: 'name', canonicalNameId: name.id },
      })),
    },
  ];

  const reportWriteError = (
    err: unknown,
    message: (error: unknown) => string,
  ) => {
    if (isRowNotFoundError(err)) {
      void invalidateDomainQueries(queryClient, domain);
      return t('canonical.errors.rowNotFound');
    }
    return message(err);
  };

  const submitDraft = () => {
    const next = draft.trim();
    if (next === '') {
      setDraftError(t('canonical.name.required'));
      return;
    }
    if (next === name.name) {
      setDraftError(t('canonical.name.unchanged'));
      return;
    }
    if (next.length > NAME_MAX_LENGTH) {
      setDraftError(t('canonical.name.tooLong', { max: NAME_MAX_LENGTH }));
      return;
    }
    setDraftError(null);
    setConfirmError(null);
    setPendingName(next);
    setConfirm('rename');
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      submitDraft();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditing(false);
    }
  };

  const confirmRename = async () => {
    setConfirmError(null);
    try {
      await onRename(pendingName);
      const orders = impact?.orderCount ?? name.orderCount;
      toast.success(
        isLocation
          ? t('canonical.name.renamedCount', {
              orders,
              ordersNoun: pluralAr(t, 'order', orders),
            })
          : t('canonical.name.renamed', { name: pendingName }),
      );
      setConfirm(null);
      setEditing(false);
    } catch (err) {
      setConfirmError(
        reportWriteError(err, (error) =>
          getApiErrorMessage(error, t('canonical.errors.generic')),
        ),
      );
    }
  };

  const confirmDelete = async () => {
    setConfirmError(null);
    try {
      await onDelete();
      setConfirm(null);
      onOpenChange(false);
    } catch (err) {
      setConfirmError(
        reportWriteError(err, (error) => deleteNameErrorMessage(error, name.name)),
      );
    }
  };

  const unlinkAlias = async (alias: NameImpactAlias) => {
    if (!onUnlinkAlias) return;
    setAliasError(null);
    setUnlinking(alias.normalizedText);
    try {
      await onUnlinkAlias(alias);
    } catch (err) {
      setAliasError(
        reportWriteError(err, (error) =>
          getApiErrorMessage(error, t('canonical.errors.generic')),
        ),
      );
    } finally {
      setUnlinking(null);
    }
  };

  const addSynonym = async (option: ComboOption) => {
    const group = unlinkedGroups.find(
      (candidate) => groupKey(candidate) === option.id,
    );
    if (!group || !onAddSynonym) return;
    setAliasError(null);
    try {
      await onAddSynonym(group);
    } catch (err) {
      setAliasError(
        reportWriteError(err, (error) =>
          getApiErrorMessage(error, t('canonical.errors.generic')),
        ),
      );
    }
  };

  const renameBody: ReactNode = impact ? (
    <div className="flex flex-col gap-2 text-sm text-foreground">
      <p className="font-semibold">{pendingName}</p>
      {isLocation ? (
        <>
          <p>{t('canonical.impact.locRename', { old: name.name })}</p>
          <p>
            {impact.rowCount} {t('canonical.impact.rowsLabel')}
          </p>
        </>
      ) : (
        <p>
          {t('canonical.impact.attrRename', {
            rows: impact.rowCount,
            rowsNoun: pluralAr(t, 'item', impact.rowCount),
            products: impact.productCount,
            productsNoun: pluralAr(t, 'product', impact.productCount),
          })}
        </p>
      )}
    </div>
  ) : null;

  const deleteBody: ReactNode = impact ? (
    <div className="flex flex-col gap-2 text-sm text-foreground">
      {isGovernorate && impact.children.length > 0 && (
        <p>
          {t('canonical.impact.locDelete', {
            cities: impact.children.map((child) => child.name).join('، '),
          })}
        </p>
      )}
      {!isLocation && (
        <p>
          {t('canonical.impact.attrDelete', {
            rows: impact.rowCount,
            rowsNoun: pluralAr(t, 'item', impact.rowCount),
            products: impact.productCount,
            productsNoun: pluralAr(t, 'product', impact.productCount),
          })}
        </p>
      )}
    </div>
  ) : null;

  const blockedRows = isLocation && impact ? impact.rowCount : 0;
  const blockedRowsText =
    blockedRows > 0
      ? t('canonical.impact.blocked', {
          rows: blockedRows,
          locationNoun: pluralAr(t, 'location', blockedRows),
        })
      : null;
  const blockedCitiesText =
    blockedCityNames.length > 0
      ? t('canonical.impact.blockedCities', {
          cities: blockedCityNames.join('، '),
        })
      : null;
  const deleteReason = blockedRowsText ?? blockedCitiesText;

  const body = (
    <div className="flex flex-col gap-6">
      {name.isSystem && (
        <Badge variant="outline">{t('canonical.name.system')}</Badge>
      )}
      {isLocation && (
        <p className="text-sm text-muted-foreground">
          {t('canonical.name.locationNote')}
        </p>
      )}

      {canEdit &&
        (editing ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              aria-label={t('canonical.name.label')}
              value={draft}
              autoFocus
              maxLength={NAME_MAX_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              aria-invalid={draftError !== null}
              className="min-h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {draft.length > NAME_COUNTER_AFTER && (
              <p className="text-xs text-muted-foreground text-end">
                {draft.length}/{NAME_MAX_LENGTH}
              </p>
            )}
            {draftError && (
              <p role="alert" className="text-sm text-destructive">
                {draftError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-11 min-w-11"
                onClick={submitDraft}
              >
                {t('canonical.action.continueToImpact')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-11"
                onClick={() => setEditing(false)}
              >
                {t('canonical.action.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 min-w-11 self-start"
            onClick={() => {
              setDraft(name.name);
              setDraftError(null);
              setEditing(true);
            }}
          >
            {t('canonical.action.rename')}
          </Button>
        ))}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground-heading">
          {t('canonical.impact.aliasesTitle')}
        </h3>
        {impact && impact.aliases.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('canonical.impact.aliasesEmpty')}
          </p>
        )}
        <ul className="flex flex-col">
          {impact?.aliases.map((alias) => (
            <li
              key={alias.normalizedText}
              className="flex min-h-11 items-center justify-between gap-2"
            >
              <VisualizedSpelling text={alias.sourceText} />
              {canEdit && onUnlinkAlias && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 min-w-11"
                  disabled={unlinking !== null}
                  onClick={() => void unlinkAlias(alias)}
                >
                  {t('canonical.action.unlink')}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {canEdit && onAddSynonym && unlinkedGroups.length > 0 && (
          <LinkCombobox
            groups={synonymGroups}
            triggerLabel={t('canonical.action.addSynonym')}
            ariaLabel={t('canonical.action.addSynonym')}
            placement="popover"
            onSelect={(_target, option) => void addSynonym(option)}
          />
        )}
        {aliasError && (
          <p role="alert" className="text-sm text-destructive">
            {aliasError}
          </p>
        )}
      </section>

      {isGovernorate && impact && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground-heading">
            {t('canonical.impact.childrenTitle')}
          </h3>
          {impact.children.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('canonical.impact.childrenEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col">
              {impact.children.map((child) => (
                <li
                  key={child.id}
                  className="flex min-h-11 items-center justify-between gap-2"
                >
                  <span className="min-w-0 break-words text-sm text-foreground">
                    {child.name}
                  </span>
                  <Badge variant="outline">
                    {t('canonical.name.orderCount', {
                      count: child.orderCount,
                      ordersNoun: pluralAr(t, 'order', child.orderCount),
                    })}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!isLocation && impact && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground-heading">
            {t('canonical.impact.productsTitle')}
          </h3>
          {impact.products.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('canonical.impact.productsEmpty')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {impact.products.data.map((product) => (
                <div key={product.productId} className="flex flex-col gap-1">
                  <p className="break-words text-sm font-medium text-foreground">
                    {product.productName}
                  </p>
                  <ul className="flex flex-col">
                    {product.rows.map((row) => (
                      <li key={row.id} className="min-h-11 py-1">
                        <VisualizedSpelling text={row.storedName} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <PaginationFooter
                currentPage={impact.products.page}
                totalPages={Math.max(
                  1,
                  Math.ceil(impact.products.total / impact.products.limit),
                )}
                totalItems={impact.products.total}
                hasNextPage={
                  impact.products.page * impact.products.limit <
                  impact.products.total
                }
                hasPreviousPage={impact.products.page > 1}
                onPageChange={setPage}
                onPrevious={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                onNext={() => setPage((current) => current + 1)}
                currentPageSize={limit}
                onPageSizeChange={(size) => {
                  setLimit(size);
                  setPage(1);
                }}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );

  const footer = name.isSystem ? (
    <p className="text-sm text-muted-foreground">
      {t('canonical.errors.systemName')}
    </p>
  ) : canEdit ? (
    <Button
      type="button"
      variant="destructive"
      className="min-h-11 min-w-11 w-full"
      onClick={() => {
        setConfirmError(null);
        setConfirm('delete');
      }}
    >
      {t('canonical.action.delete')}
    </Button>
  ) : undefined;

  return (
    <>
      <EntitySideSheet
        open={open}
        onOpenChange={onOpenChange}
        title={name.name}
        description={headerDescription}
        loading={(impactQuery.isLoading || citiesQuery.isLoading) && !impact}
        error={
          impactQuery.isError && !impact
            ? {
                message: isRowNotFoundError(impactQuery.error)
                  ? t('canonical.errors.rowNotFound')
                  : t('canonical.impact.loadError'),
                onRetry: () => void impactQuery.refetch(),
              }
            : null
        }
        footer={footer}
      >
        {body}
      </EntitySideSheet>

      {confirm === 'rename' && (
        <ConfirmImpactDialog
          title={t('canonical.name.rename.title', { name: name.name })}
          description={t('canonical.impact.title.rename')}
          impact={impactForDialog}
          body={renameBody}
          tone="default"
          confirmLabel={t('canonical.action.confirm')}
          pendingLabel={t('canonical.confirm.pending')}
          onConfirm={confirmRename}
          onClose={() => {
            setConfirm(null);
            setConfirmError(null);
          }}
          error={confirmError}
        />
      )}

      {confirm === 'delete' && (
        <ConfirmImpactDialog
          title={t('canonical.impact.title.delete', { name: name.name })}
          description={headerDescription}
          impact={impactForDialog}
          body={deleteBody}
          blocked={
            deleteReason
              ? {
                  reason: deleteReason,
                  items:
                    blockedRowsText && blockedCitiesText
                      ? [blockedCitiesText]
                      : undefined,
                }
              : undefined
          }
          tone="destructive"
          confirmLabel={t('canonical.action.delete')}
          pendingLabel={t('canonical.confirm.pending')}
          onConfirm={confirmDelete}
          onClose={() => {
            setConfirm(null);
            setConfirmError(null);
          }}
          error={confirmError}
        />
      )}
    </>
  );
}
