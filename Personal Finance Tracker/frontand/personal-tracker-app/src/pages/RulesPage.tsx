import { useMemo, useState } from 'react'
import ReportPanel from '../components/reports/ReportPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useRulesData from '../hooks/useRulesData'
import type { RuleFormValues, RuleRecord } from '../types/rule'

const defaultRuleValues: RuleFormValues = {
  name: '',
  enabled: true,
  priority: '1',
  conditionField: 'merchant',
  conditionOperator: 'equals',
  conditionValue: '',
  actionType: 'set_category',
  actionValue: '',
}

function toFormValues(rule: RuleRecord | null): RuleFormValues {
  if (!rule) {
    return defaultRuleValues
  }

  return {
    name: rule.name,
    enabled: rule.enabled,
    priority: String(rule.priority),
    conditionField: rule.conditionField,
    conditionOperator: rule.conditionOperator,
    conditionValue: rule.conditionValue,
    actionType: rule.actionType,
    actionValue: rule.actionValue,
  }
}

function formatRuleSummary(
  rule: RuleRecord,
  categoryName?: string | null,
  conditionCategoryName?: string | null,
) {
  const conditionValue = rule.conditionField === 'category'
    ? (conditionCategoryName ?? rule.conditionValue)
    : rule.conditionValue
  const actionValue = rule.actionType === 'set_category' ? (categoryName ?? rule.actionValue) : rule.actionValue
  return `If ${rule.conditionField} ${rule.conditionOperator} ${conditionValue}, then ${rule.actionType} ${actionValue}`
}

function RulesPage() {
  const { categories } = useDevelopmentBootstrap()
  const { items, isLoading, error, saveRule, deleteRule } = useRulesData()
  const [editingRule, setEditingRule] = useState<RuleRecord | null>(null)
  const [values, setValues] = useState<RuleFormValues>(defaultRuleValues)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )

  const resetForm = () => {
    setEditingRule(null)
    setValues(defaultRuleValues)
    setFormError(null)
  }

  const updateField =
    (field: keyof RuleFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === 'enabled' && event.target instanceof HTMLInputElement
        ? event.target.checked
        : event.target.value

      setValues((current) => {
        const nextValues = {
          ...current,
          [field]: value,
        }

        if (field === 'conditionField') {
          if (value === 'amount') {
            nextValues.conditionOperator = 'greater_than'
          } else {
            nextValues.conditionOperator = 'equals'
          }
          nextValues.conditionValue = ''
        }

        if (field === 'actionType') {
          nextValues.actionValue = ''
        }

        return nextValues
      })
    }

  const handleEdit = (rule: RuleRecord) => {
    setEditingRule(rule)
    setValues(toFormValues(rule))
    setFormError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (values.name.trim() === '' || values.conditionValue.trim() === '' || values.actionValue.trim() === '') {
      setFormError('Name, condition value, and action value are required.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)
      await saveRule(values, editingRule?.id)
      resetForm()
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : 'Failed to save rule.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (ruleId: string) => {
    try {
      setFormError(null)
      await deleteRule(ruleId)
      if (editingRule?.id === ruleId) {
        resetForm()
      }
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : 'Failed to delete rule.')
    }
  }

  const availableOperators = values.conditionField === 'amount'
    ? [
        { value: 'equals', label: 'Equals' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
      ]
    : [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'starts_with', label: 'Starts with' },
      ]

  const actionValueInput = values.actionType === 'set_category' ? (
    <select value={values.actionValue} onChange={updateField('actionValue')}>
      <option value="">Select category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  ) : (
    <input
      value={values.actionValue}
      onChange={updateField('actionValue')}
      placeholder={
        values.actionType === 'add_tag'
          ? 'monthly-food'
          : 'High amount transaction alert'
      }
    />
  )

  const conditionValueInput = values.conditionField === 'category' ? (
    <select value={values.conditionValue} onChange={updateField('conditionValue')}>
      <option value="">Select category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  ) : values.conditionField === 'type' ? (
    <select value={values.conditionValue} onChange={updateField('conditionValue')}>
      <option value="">Select type</option>
      <option value="expense">Expense</option>
      <option value="income">Income</option>
      <option value="transfer">Transfer</option>
    </select>
  ) : values.conditionField === 'amount' ? (
    <input type="number" min="0" step="0.01" value={values.conditionValue} onChange={updateField('conditionValue')} />
  ) : (
    <input value={values.conditionValue} onChange={updateField('conditionValue')} />
  )

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Rules</p>
          <h2>Automation rules</h2>
        </div>
        <p className="page-description">
          Build transaction rules with condition and action pairs. Rules drive transaction suggestions and alert automation.
        </p>
      </header>

      <div className="budget-layout">
        <section className="report-panel" data-tour="rules-builder">
          <header className="report-panel-header">
            <div>
              <h3>{editingRule ? 'Edit rule' : 'Create rule'}</h3>
              <p>Same condition plus same action type is allowed only once.</p>
            </div>
          </header>

          <div className="report-panel-body">
            <form className="transaction-form" onSubmit={handleSubmit}>
              <div className="transaction-form-grid">
                <label className="field field-full">
                  <span>Rule name</span>
                  <input value={values.name} onChange={updateField('name')} />
                </label>

                <label className="field field-small">
                  <span>Priority</span>
                  <input type="number" min="1" max="999" value={values.priority} onChange={updateField('priority')} />
                </label>

                <label className="field field-small checkbox-field">
                  <span>Enabled</span>
                  <input type="checkbox" checked={values.enabled} onChange={updateField('enabled')} />
                </label>

                <label className="field">
                  <span>Condition field</span>
                  <select value={values.conditionField} onChange={updateField('conditionField')}>
                    <option value="merchant">Merchant</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                    <option value="type">Type</option>
                    <option value="payment_method">Payment method</option>
                  </select>
                </label>

                <label className="field">
                  <span>Operator</span>
                  <select value={values.conditionOperator} onChange={updateField('conditionOperator')}>
                    {availableOperators.map((operator) => (
                      <option key={operator.value} value={operator.value}>
                        {operator.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Condition value</span>
                  {conditionValueInput}
                </label>

                <label className="field">
                  <span>Action</span>
                  <select value={values.actionType} onChange={updateField('actionType')}>
                    <option value="set_category">Set category</option>
                    <option value="add_tag">Add tag</option>
                    <option value="create_alert">Create alert</option>
                  </select>
                </label>

                <label className="field">
                  <span>Action value</span>
                  {actionValueInput}
                </label>
              </div>

              {formError ? <div className="report-error">{formError}</div> : null}

              <div className="transaction-form-actions">
                {editingRule ? (
                  <button type="button" className="secondary-button" onClick={resetForm}>
                    Cancel edit
                  </button>
                ) : null}
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingRule ? 'Update rule' : 'Save rule'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <div data-tour="rules-saved-list">
          <ReportPanel
            title="Saved rules"
            subtitle="Priority order runs from smaller number to larger number."
          >
            <div className="dashboard-list">
            {isLoading ? <div className="empty-state">Loading rules...</div> : null}
            {error ? (
              <div className="report-error" role="alert">
                <strong>Unable to load rules.</strong>
                <span>{error}</span>
              </div>
            ) : null}
            {!isLoading && !error && items.length === 0 ? (
              <div className="empty-state">No rules saved yet.</div>
            ) : null}

            {items.map((rule) => (
              <article key={rule.id} className="rule-card">
                <div className="rule-card-header">
                  <div>
                    <strong>{rule.name}</strong>
                    <span>Priority {rule.priority} · {rule.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <span className={rule.enabled ? 'budget-state budget-state-safe' : 'budget-state'}>
                    {rule.enabled ? 'On' : 'Off'}
                  </span>
                </div>

                <p className="rule-card-summary">
                  {formatRuleSummary(
                    rule,
                    categoryMap.get(rule.actionValue) ?? null,
                    categoryMap.get(rule.conditionValue) ?? null,
                  )}
                </p>

                <div className="budget-card-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(rule)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button" onClick={() => void handleDelete(rule.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            </div>
          </ReportPanel>
        </div>
      </div>
    </section>
  )
}

export default RulesPage
