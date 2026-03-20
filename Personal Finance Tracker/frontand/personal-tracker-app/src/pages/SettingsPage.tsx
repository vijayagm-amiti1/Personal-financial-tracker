import { useEffect, useState } from 'react'
import ReportPanel from '../components/reports/ReportPanel'
import { useAuth } from '../auth/AuthProvider'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import { authFetch } from '../utils/authFetch'
import type { UserSettings } from '../types/auth'
import { CATEGORY_ICON_OPTIONS, renderCategoryIcon } from '../utils/categoryIcons'
import { dispatchSettingsRefresh } from '../utils/appEvents'
import { API_BASE_URL } from '../config/env'

const SETTINGS_ENDPOINT = `${API_BASE_URL}/api/settings`

const emailNotificationField: { key: keyof Omit<UserSettings, 'email' | 'displayName'>; title: string; description: string } = {
  key: 'allowSendEmailNotification',
  title: 'Email notifications',
  description: 'Allow the app to send email notifications when supported flows trigger them.',
}

const toggleFields: Array<{ key: keyof Omit<UserSettings, 'email' | 'displayName'>; title: string; description: string }> = [
  {
    key: 'allowBudgetThresholdAlert',
    title: 'Budget threshold alerts',
    description: 'Send alerts when a budget crosses its configured threshold percentage.',
  },
  {
    key: 'allowBudgetExceededAlert',
    title: 'Budget exceeded alerts',
    description: 'Send alerts when a budget reaches or exceeds 100% of its planned amount.',
  },
  {
    key: 'allowGoalNotification',
    title: 'Goal notifications',
    description: 'Allow goal-related progress notifications to be generated for your account.',
  },
  {
    key: 'allowGoalCompletionBeforeTargetDateNotification',
    title: 'Goal completed before target date',
    description: 'Send a notification when a goal is completed before its target date.',
  },
  {
    key: 'allowGoalMissedTargetDateNotification',
    title: 'Goal missed target date',
    description: 'Send a notification when a goal is still incomplete after its target date passes.',
  },
  {
    key: 'allowMonthlyBudgetReport',
    title: 'Monthly budget report',
    description: 'Allow a monthly budget summary report notification or email when available.',
  },
]

const emptySettings: UserSettings = {
  email: '',
  displayName: '',
  allowSendEmailNotification: false,
  allowBudgetThresholdAlert: false,
  allowBudgetExceededAlert: false,
  allowGoalNotification: false,
  allowGoalCompletionBeforeTargetDateNotification: false,
  allowGoalMissedTargetDateNotification: false,
  allowMonthlyBudgetReport: false,
  navbarVerticalEnabled: false,
}

async function extractErrorMessage(response: Response) {
  try {
    const payload = await response.json()
    if (payload && typeof payload.message === 'string' && payload.message.trim() !== '') {
      return payload.message
    }
  } catch {
    return null
  }

  return null
}

function SettingsPage() {
  const { refreshUser } = useAuth()
  const { categories, createCategory } = useDevelopmentBootstrap()
  const [settings, setSettings] = useState<UserSettings>(emptySettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense')
  const [categoryColor, setCategoryColor] = useState('#1153c2')
  const [categoryIcon, setCategoryIcon] = useState('shopping-basket')
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [categorySuccessMessage, setCategorySuccessMessage] = useState<string | null>(null)
  const [isCategorySaving, setIsCategorySaving] = useState(false)

  useEffect(() => {
    let active = true

    const loadSettings = async () => {
      setIsLoading(true)
      setError(null)

      const response = await authFetch(SETTINGS_ENDPOINT)
      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load settings.')
      }

      const payload = (await response.json()) as UserSettings
      if (active) {
        setSettings(payload)
      }
    }

    void loadSettings()
      .catch((caughtError) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : 'Failed to load settings.')
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const handleToggleChange = (key: keyof Omit<UserSettings, 'email' | 'displayName'>) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await authFetch(SETTINGS_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to save settings.')
      }

      const payload = (await response.json()) as UserSettings
      setSettings(payload)
      await refreshUser()
      dispatchSettingsRefresh()
      setSuccessMessage('Settings updated successfully.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (categoryName.trim() === '') {
      setCategoryError('Category name is required.')
      return
    }

    try {
      setCategoryError(null)
      setCategorySuccessMessage(null)
      setIsCategorySaving(true)
      await createCategory({
        name: categoryName.trim(),
        type: categoryType,
        color: categoryColor,
        icon: categoryIcon,
      })
      setCategoryName('')
      setCategoryType('expense')
      setCategoryColor('#1153c2')
      setCategoryIcon('shopping-basket')
      setCategorySuccessMessage('Category created successfully.')
    } catch (caughtError) {
      setCategoryError(caughtError instanceof Error ? caughtError.message : 'Failed to create category.')
    } finally {
      setIsCategorySaving(false)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Profile and notification preferences</h2>
        </div>
        <p className="page-description">
          Control your profile name and which goal, budget, report, and email notifications are allowed for your account.
        </p>
      </header>

      <div className="budget-layout">
        <ReportPanel
          title="Profile"
          subtitle="Display name is shown across the app. Email is your login identity and stays read-only here."
        >
          {isLoading ? (
            <div className="notification-empty">Loading settings...</div>
          ) : (
            <form className="transaction-form settings-form" onSubmit={handleSubmit}>
              <div className="settings-profile-grid">
                <label className="field">
                  <span>Display name</span>
                  <input
                    value={settings.displayName}
                    onChange={(event) => setSettings((current) => ({ ...current, displayName: event.target.value }))}
                    maxLength={120}
                    required
                  />
                </label>

                <label className="field">
                  <span>Email</span>
                  <input value={settings.email} disabled />
                </label>
              </div>

              <div className="settings-toggle-list">
                <label className="settings-toggle-card">
                  <div>
                    <strong>Desktop navigation layout</strong>
                    <p>For screens larger than tablet size, choose whether navigation should be vertical instead of horizontal.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.navbarVerticalEnabled}
                    aria-label="Desktop navigation layout"
                    className={settings.navbarVerticalEnabled ? 'settings-switch settings-switch-enabled' : 'settings-switch'}
                    onClick={() => handleToggleChange('navbarVerticalEnabled')}
                  >
                    <span className="settings-switch-icon">{settings.navbarVerticalEnabled ? '✓' : ''}</span>
                    <span className="settings-switch-thumb" />
                  </button>
                </label>

                <label className="settings-toggle-card">
                  <div>
                    <strong>{emailNotificationField.title}</strong>
                    <p>{emailNotificationField.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[emailNotificationField.key]}
                    aria-label={emailNotificationField.title}
                    className={settings[emailNotificationField.key] ? 'settings-switch settings-switch-enabled' : 'settings-switch'}
                    onClick={() => handleToggleChange(emailNotificationField.key)}
                  >
                    <span className="settings-switch-icon">{settings[emailNotificationField.key] ? '✓' : ''}</span>
                    <span className="settings-switch-thumb" />
                  </button>
                </label>

                {settings.allowSendEmailNotification ? toggleFields.map((field) => (
                  <label key={field.key} className="settings-toggle-card">
                    <div>
                      <strong>{field.title}</strong>
                      <p>{field.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings[field.key]}
                      aria-label={field.title}
                      className={settings[field.key] ? 'settings-switch settings-switch-enabled' : 'settings-switch'}
                      onClick={() => handleToggleChange(field.key)}
                    >
                      <span className="settings-switch-icon">{settings[field.key] ? '✓' : ''}</span>
                      <span className="settings-switch-thumb" />
                    </button>
                  </label>
                )) : null}
              </div>

              {error ? <div className="report-error">{error}</div> : null}
              {successMessage ? <div className="report-success">{successMessage}</div> : null}

              <div className="transaction-form-actions">
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </form>
          )}
        </ReportPanel>

        <ReportPanel
          title="Categories"
          subtitle="Create the income and expense categories you want available across transactions, budgets, and recurring plans."
        >
          <form className="transaction-form settings-form" onSubmit={handleCategorySubmit}>
            <div className="transaction-form-grid">
              <label className="field">
                <span>Category name</span>
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  maxLength={120}
                  placeholder="Groceries, Salary, Transport..."
                />
              </label>

              <label className="field field-small">
                <span>Type</span>
                <select value={categoryType} onChange={(event) => setCategoryType(event.target.value as 'income' | 'expense')}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label className="field field-small">
                <span>Color</span>
                <input type="color" value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} />
              </label>
            </div>

            <div className="field">
              <span>Icon</span>
              <div className="icon-picker-grid">
                {CATEGORY_ICON_OPTIONS.slice(0, 20).map((iconOption) => (
                  <button
                    key={iconOption.key}
                    type="button"
                    className={categoryIcon === iconOption.key ? 'icon-picker-button icon-picker-button-active' : 'icon-picker-button'}
                    onClick={() => setCategoryIcon(iconOption.key)}
                  >
                    <span className="icon-picker-visual" style={{ color: categoryColor }}>
                      {renderCategoryIcon(iconOption.key, { size: 18, strokeWidth: 2 })}
                    </span>
                    <span className="icon-picker-label">{iconOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {categoryError ? <div className="report-error">{categoryError}</div> : null}
            {categorySuccessMessage ? <div className="report-success">{categorySuccessMessage}</div> : null}

            <div className="transaction-form-actions">
              <button type="submit" className="primary-button" disabled={isCategorySaving}>
                {isCategorySaving ? 'Saving...' : 'Add category'}
              </button>
            </div>
          </form>

          <div className="settings-category-list">
            {categories.length === 0 ? (
              <div className="notification-empty">No categories created yet.</div>
            ) : (
              categories.map((category) => (
                <article key={category.id} className="settings-category-item">
                  <span className="settings-category-icon" style={{ color: category.color }}>
                    {renderCategoryIcon(category.icon, { size: 18, strokeWidth: 2.2 })}
                  </span>
                  <div className="settings-category-meta">
                    <strong>{category.name}</strong>
                    <span>{category.type}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </ReportPanel>
      </div>
    </section>
  )
}

export default SettingsPage
