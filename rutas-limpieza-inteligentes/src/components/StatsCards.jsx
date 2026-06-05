import { Gauge, AlertTriangle, MapPin, TrendingDown } from 'lucide-react'

export default function StatsCards({ stats }) {
  const cards = [
    {
      icon: MapPin,
      label: 'Reportes totales',
      value: stats.total,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-bg)',
    },
    {
      icon: AlertTriangle,
      label: 'Puntos críticos',
      value: stats.critical,
      color: 'var(--severity-critico-badge)',
      bg: 'var(--severity-critico-bg)',
      pulse: true,
    },
    {
      icon: Gauge,
      label: 'Distancia',
      value: stats.distance > 0 ? `${stats.distance} km` : '—',
      color: 'var(--color-secondary)',
      bg: 'var(--color-secondary-bg)',
    },
    {
      icon: TrendingDown,
      label: 'Ahorro',
      value: stats.savings > 0 ? `${stats.savings}%` : '—',
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-bg)',
    },
  ]

  return (
    <div className="stats-scroll hide-scrollbar">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`stats-card ${card.pulse ? 'stats-card-pulse' : ''}`}
          style={{
            background: 'var(--stats-card-bg)',
            borderRadius: 10,
            padding: '8px 14px',
            border: '1px solid var(--stats-card-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 140,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <card.icon size={16} color={card.color} />
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.2,
                color: card.pulse ? card.color : 'var(--text-primary)',
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--stats-card-label)', whiteSpace: 'nowrap' }}>
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
