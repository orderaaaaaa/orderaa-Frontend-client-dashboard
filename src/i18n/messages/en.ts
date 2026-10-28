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
  'common.theme.toggle': 'Toggle dark mode',
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
    'Approved quantities are received into this destination when receiving receipts in this scope are confirmed.',
  'stockRules.inbound.placeholder': 'Select the receiving warehouse',
  'stockRules.inbound.missingGlobal':
    'No destination is set for supplier receiving — receipts not covered by another inbound rule cannot be approved until a destination is set.',
  'stockRules.inbound.inheritsHint':
    'This scope follows the receiving destination above it.',
  'stockRules.inbound.saved': 'Receiving destination saved successfully',
  'stockRules.inbound.deleted': 'Receiving destination deleted',
  'stockRules.warehouseInactiveSuffix': ' (inactive)',

  'warehouses.deactivateHint':
    'The warehouse cannot be deactivated while stock rules depend on it.',

  'receipts.warehouseAuto': 'Automatic, based on receiving rules',
  'receipts.noInboundWarning':
    'No general supplier-receiving destination is set — receipts not covered by another receiving rule cannot be approved until a destination is set.',

  'products.confirmOutOfStock.inherit': 'Follow the store ({value})',
  'products.confirmOutOfStock.followWorkflow': 'Follow the system',
  'products.confirmOutOfStock.followWorkflowHint':
    'The stock movement rules decide what happens to this product, whatever the store setting.',
  'products.confirmOutOfStock.allowNegative': 'Allow negative stock',
  'products.confirmOutOfStock.forbid': 'Forbid',
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

  'stock.filters.movementDateHint':
    'Shows products that had a stock movement in the selected period',

  'storeSettings.confirmOutOfStock.title': 'Confirming orders that are out of stock',
  'storeSettings.confirmOutOfStock.followWorkflow': 'Follow the system',
  'storeSettings.confirmOutOfStock.allowNegative': 'Allow negative stock',
  'storeSettings.confirmOutOfStock.forbid': 'Forbid',
  'storeSettings.confirmOutOfStock.followWorkflowDescription':
    'The stock movement rules decide what happens when an out-of-stock order is confirmed.',
  'storeSettings.confirmOutOfStock.allowNegativeDescription':
    'The order is confirmed and the warehouse balance goes negative when stock is short.',
  'storeSettings.confirmOutOfStock.forbidDescription':
    'An order containing an out-of-stock product cannot be confirmed.',
  'stockShortage.line': '{product} - {variant}: required {required}, available {available}',
  'stockShortage.lineNoVariant': '{product}: required {required}, available {available}',
  'stockShortage.confirmBlocked':
    'Cannot confirm: the following products are out of stock and their settings forbid it, choose another product:',
  'stockShortage.insufficientFallback': 'There is not enough stock to complete this action.',
  'stockShortage.batchFallback': 'The batch was not saved because some orders lack stock.',
  'stockShortage.transferOverAvailable':
    'The quantity to transfer exceeds what is available in the warehouse:',
  'stockShortage.confirmWarning':
    'Stock may not be enough for this status, and the system may refuse the confirmation:',
  'stockShortage.reasonShortage': 'Not enough stock',
  'stockShortage.reasonBlocked': 'Confirmation blocked by stock',
  'stockShortage.event.title': 'Stock shortage blocked a status change',
  'lineEdit.event.title': 'Sent back to packing to edit products',
  'orderEvent.returnRefundRecorded': 'Return refund recorded',
  'lineEdit.event.action.add': 'Add product',
  'lineEdit.event.action.update': 'Edit product',
  'lineEdit.event.action.delete': 'Delete product',
  'lineEdit.event.bypassed': 'Stock not moved for {count} variants',
  'stockShortage.event.transitionBlocked': 'Stock shortage blocked the change from {fromStatus} to {toStatus}',
  'stockShortage.event.transitionBlockedWarehouse':
    'Stock shortage in {warehouseName} blocked the change from {fromStatus} to {toStatus}',
  'orderDetails.stock.bypassed': 'No stock movement',
  'stockShortage.event.carrierNotApplied':
    'The carrier reported {status} but the status was not updated: stock shortage for {productName} in {warehouseName}',
  'stockShortage.event.machineTransition':
    'The transition to {status} was not applied due to a stock shortage: {productName} in {warehouseName}',
  'stockShortage.event.storeCreation':
    'The store order arrived but its stock was not reserved due to a stock shortage: {productName} in {warehouseName}',
  'stockShortage.event.carrierNotAppliedNoWarehouse':
    'The carrier reported {status} but the status was not updated: stock shortage for {productName}',
  'stockShortage.event.machineTransitionNoWarehouse':
    'The transition to {status} was not applied due to a stock shortage: {productName}',
  'stockShortage.event.storeCreationNoWarehouse':
    'The store order arrived but its stock was not reserved due to a stock shortage: {productName}',
  'stockShortage.event.shortageTitle': 'Stock shortage',
  'stockShortage.event.retryTitle': 'Re-apply status',
  'stockShortage.event.retryApplied':
    'The status was re-applied after the stock was fixed: {status}',
  'stockShortage.event.retryStoreCreationTitle': 'Re-apply stock',
  'stockShortage.event.retryStoreCreationApplied': "The order's stock was reserved after the stock was fixed",
  'stockShortage.event.retryStoreUpdateTitle': 'Re-apply store update',
  'stockShortage.event.retryStoreUpdateApplied': 'The store update was applied after the stock was fixed',
  'orderSystemFailures.retry.action': 'Re-apply status',
  'orderSystemFailures.retry.success': 'Status re-applied',
  'orderSystemFailures.retry.failed': 'Could not re-apply the status',
  'orderSystemFailures.retryStoreCreation.action': 'Re-apply stock',
  'orderSystemFailures.retryStoreCreation.success': 'Stock re-applied',
  'orderSystemFailures.retryStoreCreation.failed': 'Could not re-apply the stock',
  'orderSystemFailures.retryStoreUpdate.action': 'Re-apply store update',
  'orderSystemFailures.retryStoreUpdate.success': 'Store update re-applied',
  'orderSystemFailures.retryStoreUpdate.failed': 'Could not re-apply the store update',
  'settlementFinal.stale': 'The settlement amount changed after the page loaded. The current amount is {currentAmount}. Refresh and try again.',
  'settlementFinal.statusNotAllowed': 'The settlement amount cannot be changed for an order in status {status}.',
  'settlementFinal.formatInvalid': 'Enter an amount of at most 10 digits before the decimal point and 2 after, for example 30 or -12.50.',
  'settlementFinal.empty': 'Enter the final amount.',
  'settlementFinal.unchanged': 'The new amount equals the current amount.',
  'settlementFinal.failed': 'The final settlement amount could not be saved.',
  'settlementFinal.changeTooLarge': 'The difference between the final and current amount is too large',
  'closure.close': 'Close',
  'closure.partial': 'Partial delivery',
  'closure.refuse': 'Refuse',
  'closure.cancel': 'Cancel',
  'closure.reopen': 'Reopen',
  'closure.changeProducts': 'Change product',
  'closure.exchange': 'Exchange',
  'exchange.notice': 'Exchange is not completed yet. It cannot be carried out from here yet.',
  'orderNotices.badge.label': 'Notices',
  'orderNotices.badge.ariaLabel': 'Show order notices, unread {count}',
  'orderNotices.dialog.title': 'Order notices',
  'orderNotices.dialog.loadError': 'Could not load notices',
  'orderNotices.dialog.empty': 'No unread notices',
  'orderNotices.dialog.loadMore': 'Show more',
  'orderNotices.dialog.markAll': 'Mark all as read',
  'orderNotices.dialog.acknowledge': 'Seen',
  'orderNotices.dialog.repeatedBefore': 'Repeated',
  'orderNotices.dialog.repeatedAfter': 'times',
  'orderNotices.error.idsNotFound': 'Some notices no longer belong to this order. Refresh the page and try again',
  'orderNotices.error.orderNotFound': 'The order does not exist or you do not have access to it',
  'orderNotices.error.forbidden': 'You do not have permission for this action',
  'orderNotices.error.markReadFailed': 'Could not mark the notices as read',
  'orderSystemFailures.label.CARRIER_STATUS_UNMAPPED': 'A status from the carrier is not known to the system',
  'orderSystemFailures.label.CARRIER_STATUS_IGNORED_STALE': 'A carrier status was ignored because it is older than the order status',
  'orderSystemFailures.label.CARRIER_STATUS_IGNORED_PARTIAL_RETURN': 'A carrier return status was ignored because the order has a partial return',
  'orderSystemFailures.label.CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW': 'A carrier status was ignored because the order is outside the shipping stage',
  'orderSystemFailures.label.CARRIER_STATUS_NOT_APPLIED': 'The carrier status was not applied',
  'orderSystemFailures.label.CARRIER_CANCELLED_LANE_APPLIED': 'A carrier status was applied to a cancelled order, review it',
  'orderSystemFailures.label.CARRIER_CANCELLED_LANE_STOCK': 'A carrier status was applied to a cancelled order: check the stock',
  'orderSystemFailures.label.CARRIER_STATUS_CORRECTED': 'The carrier changed a status we had set. Review the order',
  'orderSystemFailures.label.CARRIER_RETURN_AT_MERCHANT': 'The carrier reports the shipment is back with the merchant, and the order status did not change',
  'orderSystemFailures.label.CARRIER_MESSAGE_AFTER_SWITCH': 'A message arrived from the previous carrier after the carrier was changed: cancel the shipment there manually',
  'orderSystemFailures.label.SHIPMENT_NOT_CREATED_MISSING_ADDRESS': 'The order was not sent to shipping: the governorate or city is missing',
  'orderSystemFailures.label.SHIPMENT_NOT_CREATED_MISSING_PHONE': 'The order was not sent to shipping: the phone number is missing',
  'orderSystemFailures.label.SHIPMENT_DISPATCH_FAILED': 'Sending the order to the carrier failed',
  'orderSystemFailures.label.SHIPMENT_UPDATE_NOT_SENT': 'The update was not sent to the carrier: check the carrier before sending again',
  'orderSystemFailures.label.SHIPMENT_OUTCOME_UNKNOWN': 'Not sent: the result is unknown, check the carrier before sending again',
  'orderSystemFailures.label.OLD_SHIPMENT_STILL_LIVE': 'The old shipment is still active with the previous carrier: cancel it there',
  'orderSystemFailures.label.SHIPMENT_CANCEL_AT_CARRIER': 'The shipment is still with the carrier: cancel it manually at the carrier',
  'orderSystemFailures.label.AUTOMATION_NOT_SENT': 'The order was not sent to automation',
  'orderSystemFailures.label.AUTOMATION_SEND_FAILED': 'Sending the order to automation failed',
  'orderSystemFailures.label.AUTOMATION_MAPPING_NOT_SAVED': 'The link between the order and automation was not saved',
  'orderSystemFailures.label.AUTOMATION_RESULT_NOT_APPLIED': 'A result arrived from automation and was not applied',
  'orderSystemFailures.label.AUTOMATION_STATUS_NOT_APPLIED': 'The status from automation was not applied',
  'orderSystemFailures.label.STOCK_MOVEMENT_SKIPPED': 'A stock movement was skipped because the quantity is insufficient',
  'orderSystemFailures.label.STOCK_MOVEMENT_BYPASSED': 'Part of a stock movement was skipped because an earlier stage did not move it',
  'orderSystemFailures.label.STOCK_MOVEMENT_ALL_BYPASSED': 'Order outside stock tracking',
  'orderSystemFailures.label.STOCK_TRANSITION_BLOCKED': 'The order status change was blocked because stock is insufficient',
  'orderSystemFailures.label.MACHINE_TRANSITION_STOCK_SHORTAGE': 'The transition was not applied because of a stock shortage',
  'orderSystemFailures.label.STORE_CREATE_CREATION_STOCK_SHORTAGE': 'An order arrived from the store and its stock was not reserved because stock is insufficient',
  'orderSystemFailures.label.SCHEDULED_TRANSITION_FAILED': 'The automatic order status change failed',
  'orderSystemFailures.label.ORDER_SHADOWED': 'The order is on hold (billing)',
  'orderSystemFailures.label.SHADOW_ACTIVATION_FAILED': 'Activating the held order failed (billing)',
  'orderSystemFailures.label.STORE_UPDATE_NOT_NEW': 'An update arrived from the store and was not applied because the order is no longer new',
  'orderSystemFailures.label.STORE_UPDATE_UNMAPPED_VARIANT': 'An update arrived from the store and was not applied because a product is not linked',
  'orderSystemFailures.label.STORE_UPDATE_EMPLOYEE_EDITED': 'An update arrived from the store and was not applied because the order was edited',
  'orderSystemFailures.label.STORE_UPDATE_NO_CREATION_BASELINE': 'An update arrived from the store and was not applied: there is no creation data to compare with',
  'orderSystemFailures.label.STORE_UPDATE_CREATION_STOCK_SHORTAGE': 'An update arrived from the store and was not applied because stock is insufficient',
  'orderSystemFailures.label.STORE_UPDATE_FAILED': 'Applying an update from the store failed',
  'orderSystemFailures.label.fallback': 'System failure',
  'timeAgo.now': 'Just now',
  'timeAgo.ago': '{value} ago',
  'timeAgo.pair': '{first} and {second}',
  'timeAgo.amount': '{count} {unit}',
  'timeAgo.unit.day.one': 'day',
  'timeAgo.unit.day.other': 'days',
  'timeAgo.unit.hour.one': 'hour',
  'timeAgo.unit.hour.other': 'hours',
  'timeAgo.unit.minute.one': 'minute',
  'timeAgo.unit.minute.other': 'minutes',
  'common.retry': 'Retry',
  'common.close': 'Close',
  'orderSystemFailures.panel.title': 'Order issues',
  'orderSystemFailures.panel.unseenTitle': 'Issues not yet seen',
  'orderSystemFailures.panel.loadError': 'Could not load order issues',
  'orderSystemFailures.panel.markAll': 'Mark all as read',
  'orderSystemFailures.panel.empty': 'No issues for this order',
  'orderSystemFailures.panel.loadMore': 'Show more',
  'orderSystemFailures.item.repeated': 'Repeated {count} times',
  'orderSystemFailures.item.seen': 'Seen',
  'orderSystemFailures.item.firstOccurred': 'First: {time}',
  'orderSystemFailures.item.lastOccurred': 'Last: {time} ({ago})',
  'orderSystemFailures.item.seenBy': 'Seen by {name}',
  'orderSystemFailures.item.seenDone': 'Seen',
  'orderSystemFailures.item.details': 'Details',
};

export default en;
