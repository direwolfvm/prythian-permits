import { useMemo } from "react"

type Star = {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  opacity: number
  drift: number
}

function createStars(count: number): Star[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    duration: 10 + Math.random() * 10,
    delay: Math.random() * 8,
    size: 0.5 + Math.random() * 0.7,
    opacity: 0.4 + Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 40
  }))
}

export default function Snowfall() {
  const stars = useMemo(() => createStars(50), [])

  return (
    <div className="snowfall" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="snowfall__flake"
          style={{
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            fontSize: `${star.size}rem`,
            opacity: star.opacity,
            "--star-drift": `${star.drift}px`
          } as React.CSSProperties}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
