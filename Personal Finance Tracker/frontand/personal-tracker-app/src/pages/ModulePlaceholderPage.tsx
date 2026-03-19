type ModulePlaceholderPageProps = {
  title: string
  description: string
}

function ModulePlaceholderPage({
  title,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>{title}</h2>
        </div>
        <p className="page-description">{description}</p>
      </header>

      <section className="module-placeholder">
        <div className="module-placeholder-copy">
          <strong>{title} page is reserved.</strong>
          <p>{description}</p>
        </div>
        <div className="module-placeholder-grid">
          <article>
            <span>Planned</span>
            <strong>Responsive layout</strong>
          </article>
          <article>
            <span>Planned</span>
            <strong>Backend integration</strong>
          </article>
          <article>
            <span>Planned</span>
            <strong>Reusable widgets</strong>
          </article>
        </div>
      </section>
    </section>
  )
}

export default ModulePlaceholderPage
