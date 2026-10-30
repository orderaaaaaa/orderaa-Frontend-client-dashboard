import type { EntityManagerConfig } from '@/components/entity-manager/types';
import { PERMISSION_CODES } from '@/lib/permissions';
import { CANONICAL_NAME_DOMAINS, type CanonicalNameDomain } from '@/types/canonicalNames';

export type CanonicalDomainConfig = EntityManagerConfig<CanonicalNameDomain>;

const PERMISSIONS = {
  read: PERMISSION_CODES.CANONICAL_NAMES_READ,
  manage: PERMISSION_CODES.CANONICAL_NAMES_MANAGE,
};

const ATTRIBUTE_NAME_CONFIG: CanonicalDomainConfig = {
  domain: CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME,
  route: 'attribute-names',
  labels: {
    title: 'canonical.domain.attributeNames.title',
    spellingNoun: 'spelling',
    nameNoun: 'name',
    countNouns: { rows: 'item', products: 'product', orders: 'order', aliases: 'alias' },
  },
  hasScope: false,
  isLocation: false,
  columns: ['spelling', 'linkedName', 'products', 'rows', 'state'],
  actions: {
    create: true,
    rename: true,
    delete: true,
    linkRow: false,
    linkGroup: true,
    bulkLink: true,
    suggest: true,
    refresh: false,
    viewProducts: true,
    unlinkChild: false,
  },
  deleteGuard: 'none',
  showCreate: true,
  showTabCounts: true,
  permissions: PERMISSIONS,
  warnMultiContext: false,
};

const ATTRIBUTE_OPTION_CONFIG: CanonicalDomainConfig = {
  domain: CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION,
  route: 'attribute-options',
  labels: {
    title: 'canonical.domain.attributeOptions.title',
    spellingNoun: 'value',
    nameNoun: 'name',
    countNouns: { rows: 'item', products: 'product', orders: 'order', aliases: 'alias' },
  },
  hasScope: false,
  isLocation: false,
  columns: ['spelling', 'linkedName', 'products', 'rows', 'state', 'contexts'],
  actions: {
    create: true,
    rename: true,
    delete: true,
    linkRow: false,
    linkGroup: true,
    bulkLink: true,
    suggest: true,
    refresh: false,
    viewProducts: true,
    unlinkChild: false,
  },
  deleteGuard: 'none',
  showCreate: true,
  showTabCounts: true,
  permissions: PERMISSIONS,
  warnMultiContext: true,
};

const GOVERNORATE_CONFIG: CanonicalDomainConfig = {
  domain: CANONICAL_NAME_DOMAINS.GOVERNORATE,
  route: 'governorates',
  labels: {
    title: 'canonical.domain.governorates.title',
    spellingNoun: 'spelling',
    nameNoun: 'name',
    countNouns: { rows: 'location', products: 'product', orders: 'order', aliases: 'alias' },
  },
  hasScope: false,
  isLocation: true,
  columns: ['spelling', 'sources', 'orders', 'state', 'stale'],
  actions: {
    create: true,
    rename: true,
    delete: true,
    linkRow: true,
    linkGroup: false,
    bulkLink: false,
    suggest: true,
    refresh: true,
    viewProducts: false,
    unlinkChild: false,
  },
  deleteGuard: 'linkedRows',
  showCreate: true,
  showTabCounts: true,
  permissions: PERMISSIONS,
  warnMultiContext: false,
};

const CITY_CONFIG: CanonicalDomainConfig = {
  domain: CANONICAL_NAME_DOMAINS.CITY,
  route: 'cities',
  labels: {
    title: 'canonical.domain.cities.title',
    spellingNoun: 'spelling',
    nameNoun: 'name',
    countNouns: { rows: 'location', products: 'product', orders: 'order', aliases: 'alias' },
  },
  hasScope: true,
  isLocation: true,
  columns: ['spelling', 'parentGovernorate', 'sources', 'orders', 'state', 'stale'],
  actions: {
    create: true,
    rename: true,
    delete: true,
    linkRow: true,
    linkGroup: false,
    bulkLink: false,
    suggest: true,
    refresh: true,
    viewProducts: false,
    unlinkChild: false,
  },
  deleteGuard: 'linkedRows',
  showCreate: true,
  showTabCounts: true,
  permissions: PERMISSIONS,
  warnMultiContext: false,
};

const PRODUCT_CONFIG: CanonicalDomainConfig = {
  domain: CANONICAL_NAME_DOMAINS.PRODUCT,
  route: 'products',
  labels: {
    title: 'canonical.domain.products.title',
    spellingNoun: 'spelling',
    nameNoun: 'name',
    countNouns: { rows: 'item', products: 'product', orders: 'order', aliases: 'alias' },
  },
  hasScope: false,
  isLocation: false,
  columns: ['spelling', 'linkedName', 'products', 'rows', 'state'],
  actions: {
    create: true,
    rename: true,
    delete: true,
    linkRow: false,
    linkGroup: true,
    bulkLink: true,
    suggest: true,
    refresh: false,
    viewProducts: true,
    unlinkChild: false,
  },
  deleteGuard: 'none',
  showCreate: true,
  showTabCounts: true,
  permissions: PERMISSIONS,
  warnMultiContext: false,
};

export const CANONICAL_DOMAIN_CONFIGS: Record<CanonicalNameDomain, CanonicalDomainConfig> = {
  ATTRIBUTE_NAME: ATTRIBUTE_NAME_CONFIG,
  ATTRIBUTE_OPTION: ATTRIBUTE_OPTION_CONFIG,
  GOVERNORATE: GOVERNORATE_CONFIG,
  CITY: CITY_CONFIG,
  PRODUCT: PRODUCT_CONFIG,
};

export const CANONICAL_NAV_DOMAINS: readonly CanonicalNameDomain[] = [
  CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME,
  CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION,
  CANONICAL_NAME_DOMAINS.GOVERNORATE,
  CANONICAL_NAME_DOMAINS.CITY,
  CANONICAL_NAME_DOMAINS.PRODUCT,
];
