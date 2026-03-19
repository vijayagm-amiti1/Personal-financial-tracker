import type { ReactNode } from 'react'

type ReportPanelProps = {
  title: string
  subtitle: string
  children: ReactNode
}

function ReportPanel({ title, subtitle, children }: ReportPanelProps) {
  return (
    <section className="report-panel">
      <header className="report-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="report-panel-body">{children}</div>
    </section>
  )
}

export default ReportPanel
