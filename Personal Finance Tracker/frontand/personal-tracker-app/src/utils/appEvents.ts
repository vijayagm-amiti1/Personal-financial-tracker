export const NOTIFICATIONS_REFRESH_EVENT = 'finance:notifications-refresh'
export const SETTINGS_REFRESH_EVENT = 'finance:settings-refresh'
export const TRANSACTION_CREATED_EVENT = 'finance:transaction-created'

export function dispatchNotificationsRefresh() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
}

export function dispatchSettingsRefresh() {
  window.dispatchEvent(new CustomEvent(SETTINGS_REFRESH_EVENT))
}

export function dispatchTransactionCreated() {
  window.dispatchEvent(new CustomEvent(TRANSACTION_CREATED_EVENT))
}
