export default function Stars({ nivel = 0 }) {
  return (
    <div className="stars" aria-label={`Nível ${nivel} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="star"
          viewBox="0 0 20 20"
          fill={i <= nivel ? 'var(--cyan)' : 'var(--star-off)'}
        >
          <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6L10 1z" />
        </svg>
      ))}
    </div>
  )
}
