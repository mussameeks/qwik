import { Link } from 'react-router-dom'

export type Crumb = { label: string; to?: string }

export default function Breadcrumbs({items}: {items: Crumb[]}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={idx} className="crumb">
              {it.to && !isLast ? (
                <Link to={it.to}>{it.label}</Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{it.label}</span>
              )}
              {!isLast && <span className="crumb-sep">›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
