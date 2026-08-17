import type ar from './ar';

/**
 * The English catalogue, typed as `Record<keyof typeof ar, string>` on purpose:
 * a key Arabic has and English lacks, or an English key Arabic never defined,
 * is a compile error rather than a string that quietly renders in the wrong
 * language months later. Drift is the exact failure this typing exists to stop.
 *
 * Written to match the Arabic meaning. The Arabic is the reference — when the
 * two disagree, the Arabic is right.
 */
const en: Record<keyof typeof ar, string> = {
  'common.language': 'Language',
  'common.loading': 'Loading…',
  'common.errors.forbidden':
    'You do not have permission to perform this action',

  'stockRules.scope.label': 'Rule scope',
  'stockRules.scope.global': 'All products',
  'stockRules.scope.product': 'A specific product',
  'stockRules.scope.variant': 'A specific variant',
  'stockRules.scope.productLabel': 'Product',
  'stockRules.scope.productPlaceholder': 'Select a product',
  'stockRules.scope.variantLabel': 'Variant',
  'stockRules.scope.variantPlaceholder': 'Select a variant',
  'stockRules.scope.variantNeedsProduct': 'Select a product first',
  'stockRules.scope.globalHint':
    'Global rules apply to every product that has no rules of its own.',
  'stockRules.scope.overrideHint':
    'As soon as this scope has one rule of its own, the rules above it stop applying entirely — including transitions this scope has no rule for.',

  'stockRules.coverage.header':
    'This scope ({scope}) has rules of its own, so the global rules do not apply to it at all.',
  'stockRules.coverage.noCreationRule':
    'This scope has no “on order creation” rule — stock will not leave the warehouse when an order containing it is created, even if a global creation rule exists.',
  'stockRules.coverage.gapsIntro':
    'The following transitions (an order coming back from packaging to the call centre)',
  'stockRules.coverage.gapsEmphasis': 'move no stock at all',
  'stockRules.coverage.gapsIntroTail': 'in this scope:',
  'stockRules.coverage.gapLine': '{from} → {targets}',
  'stockRules.coverage.gapTargetSeparator': ', ',
  'stockRules.coverage.addRestockRule':
    'Add a restock rule to this scope if you want the stock returned in these cases.',

  'products.confirmOutOfStock.inherit': 'Follow the store ({value})',
  'products.confirmOutOfStock.allow': 'Allowed',
  'products.confirmOutOfStock.forbid': 'Forbidden',
  'products.confirmOutOfStock.placeholder': 'Confirm without stock',
  'products.confirmOutOfStock.saved': 'Confirmation setting saved',
  'products.confirmOutOfStock.saveFailed': 'Could not save the setting',

  'orderDetails.stock.available': 'Available: {count}',
  'orderDetails.stock.availableWithRequired':
    'Available: {available} (required: {required})',
  'orderDetails.stock.unavailable':
    'Out of stock — {available} available, {required} required',
  'orderDetails.stock.blocked':
    'This order cannot be confirmed with this product — choose another one',

  'orderDetails.variants.title': 'Available in stock',
  'orderDetails.variants.blockedSelection':
    'This option is out of stock and the product settings block adding it — pick something else',

  'storeSettings.confirmOutOfStock.title':
    'Allow confirming orders that are out of stock',
  'storeSettings.confirmOutOfStock.allowedDescription':
    'A call centre agent can confirm the order even when the product is out of stock. This can be blocked for a specific product from the products page.',
  'storeSettings.confirmOutOfStock.blockedDescription':
    'An agent will not be able to confirm an order containing an out-of-stock product — they will be asked to choose another one. A specific product can be excepted from the products page.',
};

export default en;
