export const NOTIFICATIONS_REFRESH_EVENT = 'finance:notifications-refresh'

export function dispatchNotificationsRefresh() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
}
