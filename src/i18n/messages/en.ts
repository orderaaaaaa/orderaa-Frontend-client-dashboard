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
  'common.save': 'Save',
  'common.delete': 'Delete',
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

  'stockRules.intro':
    'Set the automatic stock movement for order creation or a status transition. Rules that are not defined do not move stock.',
  'stockRules.event.label': 'Event type',
  'stockRules.event.creation': 'On order creation',
  'stockRules.event.transition': 'Status transition',
  'stockRules.event.inbound': 'Receiving from a supplier',
  'stockRules.side.from': 'From status',
  'stockRules.side.to': 'To status',
  'stockRules.selection.any': 'All statuses',
  'stockRules.selection.range': 'Range',
  'stockRules.selection.specific': 'Specific statuses',
  'stockRules.selection.selectAll': 'Select all',
  'stockRules.selection.clearAll': 'Clear selection',
  'stockRules.selection.anyFromHint':
    'The rule applies to any source status — no need to choose statuses.',
  'stockRules.selection.anyToHint':
    'The rule applies to any target status — no need to choose statuses.',
  'stockRules.range.start': 'Range start',
  'stockRules.range.end': 'Range end',
  'stockRules.range.previewLabel': 'Statuses covered ({count})',
  'stockRules.range.futureNote':
    'The range is dynamic: any status added later between the start and end automatically joins this rule.',
  'stockRules.errors.fromSpecificEmpty': 'Choose the source statuses',
  'stockRules.errors.toSpecificEmpty': 'Choose the target statuses',
  'stockRules.errors.rangeIncomplete': 'Choose a range start and end',
  'stockRules.errors.rangeInverted':
    'The start status must come before the end status in the status order',
  'stockRules.errors.sameStatusBothSides':
    'The same status cannot appear on both sides',
  'stockRules.errors.warehousesRequired': 'Choose both warehouses',
  'stockRules.errors.sameWarehouse':
    'The source and destination warehouses must be different',
  'stockRules.errors.duplicateRule': 'Duplicate rule for the same transition',
  'stockRules.errors.duplicateCreationRule':
    'Duplicate creation rule for the same target status',
  'stockRules.errors.creationTargetRequired':
    'Choose the target status for order creation',
  'stockRules.saveSuccess': 'Rule saved successfully',
  'stockRules.saveFailed': 'Could not save the rule',

  'stockRules.inbound.title': 'Supplier receiving destination',
  'stockRules.inbound.hint':
    'Approved quantities are received into this destination when a receiving receipt in this scope is confirmed.',
  'stockRules.inbound.placeholder': 'Select the receiving warehouse',
  'stockRules.inbound.missingGlobal':
    'No destination is set for supplier receiving — approved quantities will not be accepted until this is configured.',
  'stockRules.inbound.inheritsHint':
    'This scope follows the receiving destination above it.',
  'stockRules.inbound.saved': 'Receiving destination saved successfully',
  'stockRules.inbound.deleted': 'Receiving destination deleted',
  'stockRules.warehouseInactiveSuffix': ' (inactive)',
  'stockRules.errors.inactiveWarehouse':
    'An inactive warehouse cannot be used in the rule',

  'warehouses.deactivateHint':
    'The warehouse cannot be deactivated while stock rules depend on it.',

  'receipts.warehouseAuto': 'Automatic, based on receiving rules',
  'receipts.noInboundWarning':
    'No default receiving warehouse is set yet — receipts cannot be confirmed until this is configured.',

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
