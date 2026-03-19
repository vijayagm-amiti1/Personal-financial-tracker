import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import useNotifications from '../hooks/useNotifications'
import type { NotificationRecord } from '../types/report'
import { NOTIFICATIONS_REFRESH_EVENT } from '../utils/appEvents'

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Budgets', to: '/budgets' },
  { label: 'Goals', to: '/goals' },
  { label: 'Reports', to: '/reports' },
  { label: 'Recurring', to: '/recurring' },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Settings', to: '/settings' },
]

type NotificationMenuProps = {
  notifications: NotificationRecord[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  onRefresh: () => Promise<void>
  onOpenNotification: (notification: NotificationRecord) => Promise<NotificationRecord | void>
  onMarkAllAsRead: () => Promise<void>
}

type ProfileMenuProps = {
  profileName: string
  onLogout: () => Promise<void>
}

function NotificationMenu({
  notifications,
  unreadCount,
  isLoading,
  error,
  onRefresh,
  onOpenNotification,
  onMarkAllAsRead,
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null)
  const [notificationView, setNotificationView] = useState<'list' | 'detail'>('list')
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setNotificationView('list')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (notifications.length === 0) {
      setSelectedNotification(null)
      setNotificationView('list')
      return
    }

    setSelectedNotification((current) => {
      if (current) {
        return notifications.find((item) => item.id === current.id) ?? current
      }
      return notifications[0]
    })
  }, [notifications])

  const visibleNotifications = useMemo(() => {
    if (unreadCount > 0) {
      return notifications.filter((item) => !item.isRead)
    }
    return notifications
  }, [notifications, unreadCount])

  const formatNotificationTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleNotificationOpen = async (notification: NotificationRecord) => {
    const detailedNotification = await onOpenNotification(notification)
    setSelectedNotification(detailedNotification ?? notification)
    setNotificationView('detail')
    setIsOpen(true)
  }

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead()
    setNotificationView('list')
  }

  return (
    <div className="notification-anchor" ref={panelRef}>
      <button
        type="button"
        className="utility-icon-button notification-bell-button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => {
          const nextIsOpen = !isOpen
          setIsOpen(nextIsOpen)
          if (nextIsOpen) {
            void onRefresh()
          }
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
      </button>

      <div className={isOpen ? 'notification-panel notification-panel-open' : 'notification-panel'}>
        <div className="notification-panel-header">
          <div>
            <strong>Notifications</strong>
            <span>{unreadCount > 0 ? `${unreadCount} unread` : `${notifications.length} total`}</span>
          </div>
          <button
            type="button"
            className="notification-link-button"
            onClick={() => void handleMarkAllAsRead()}
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>

        <div className="notification-panel-body">
          {notificationView === 'list' ? (
            <div className="notification-list notification-list-full">
              {isLoading ? <div className="notification-empty">Loading notifications...</div> : null}
              {error ? <div className="notification-empty">{error}</div> : null}
              {!isLoading && !error && visibleNotifications.length === 0 ? (
                <div className="notification-empty">No notifications yet.</div>
              ) : null}
              {visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={
                    selectedNotification?.id === notification.id
                      ? 'notification-item notification-item-active'
                      : notification.isRead
                        ? 'notification-item'
                        : 'notification-item notification-item-unread'
                  }
                  onClick={() => void handleNotificationOpen(notification)}
                >
                  <div className="notification-item-header">
                    <strong>{notification.title}</strong>
                    {!notification.isRead ? <span className="notification-dot" /> : null}
                  </div>
                  <span>{formatNotificationTime(notification.createdAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="notification-detail notification-detail-full">
              <button
                type="button"
                className="notification-back-button"
                onClick={() => setNotificationView('list')}
              >
                Back to notifications
              </button>
              {selectedNotification ? (
                <>
                  <span className="notification-detail-type">{selectedNotification.type.replaceAll('_', ' ')}</span>
                  <h3>{selectedNotification.title}</h3>
                  <p className="notification-detail-time">{formatNotificationTime(selectedNotification.createdAt)}</p>
                  <p>{selectedNotification.message}</p>
                </>
              ) : (
                <div className="notification-empty">Select a notification to view it.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileMenu({ profileName, onLogout }: ProfileMenuProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="profile-menu-anchor" ref={menuRef}>
      <button
        type="button"
        className="profile-chip profile-chip-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{profileName}</span>
        <ChevronDown size={16} />
      </button>
      <div className={isOpen ? 'profile-menu profile-menu-open' : 'profile-menu'}>
        <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/about')}>
          About Us
        </button>
        <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/faq')}>
          FAQ
        </button>
        <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/report-issue')}>
          Report Issue
        </button>
        <button type="button" className="profile-menu-item" onClick={() => handleNavigate('/help')}>
          Help
        </button>
        <button
          type="button"
          className="profile-menu-item profile-menu-item-danger"
          onClick={() => {
            setIsOpen(false)
            void onLogout()
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileName, setProfileName] = useState(() => user?.displayName ?? '')
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    error: notificationsError,
    loadNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ userId: user?.id ?? '' })

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    setProfileName(user?.displayName ?? '')
  }, [location.pathname, user])

  useEffect(() => {
    const handleWindowFocus = () => {
      void loadNotifications()
    }

    const handleNotificationsRefresh = () => {
      void loadNotifications()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void loadNotifications()
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadNotifications])

  const handleNotificationOpen = async (notification: NotificationRecord) => {
    let detailedNotification = notification

    try {
      detailedNotification = await getNotificationById(notification.id)
    } catch {
      detailedNotification = notification
    }

    if (!notification.isRead) {
      try {
        detailedNotification = (await markAsRead(notification.id)) ?? detailedNotification
      } catch {
        return detailedNotification
      }
    }
    return detailedNotification
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch {
      return
    }
  }

  const renderUtilityContent = () => (
    <>
      <button
        type="button"
        className="utility-button utility-button-primary"
        onClick={() => window.location.assign('/transactions/new')}
      >
        Add Transaction
      </button>
      <NotificationMenu
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={notificationsLoading}
        error={notificationsError}
        onRefresh={loadNotifications}
        onOpenNotification={handleNotificationOpen}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      <ProfileMenu
        profileName={profileName}
        onLogout={async () => {
          await logout()
          window.location.assign('/login')
        }}
      />
    </>
  )

  const navigationContent = navigationItems.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        isActive ? 'nav-link nav-link-active' : 'nav-link'
      }
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {item.label}
    </NavLink>
  ))

  return (
    <div className="app-shell">
      <header className="top-shell">
        <div className="top-shell-row">
          <div className="brand-lockup">
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="brand-badge">PF</div>
            <div>
              <p className="eyebrow">Personal Finance Tracker</p>
              <h1>Money clarity without clutter.</h1>
            </div>
          </div>

          <div className="utility-bar utility-bar-desktop">{renderUtilityContent()}</div>
        </div>

        <nav className="primary-nav primary-nav-desktop" aria-label="Primary">
          {navigationContent}
        </nav>

        <div className={isMobileMenuOpen ? 'mobile-menu-panel mobile-menu-panel-open' : 'mobile-menu-panel'}>
          <div className="utility-bar utility-bar-mobile">{renderUtilityContent()}</div>
          <nav className="primary-nav primary-nav-mobile" aria-label="Mobile primary">
            {navigationContent}
          </nav>
        </div>
      </header>

      <main className="main-content shell-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
