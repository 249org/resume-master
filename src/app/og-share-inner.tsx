/** Shared JSX for `opengraph-image` and `twitter-image` (next/og). */
export function OgShareInner() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 72,
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #0c4a6e 100%)',
        color: '#f8fafc',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          RM
        </div>
        <span style={{ fontSize: 22, opacity: 0.85, letterSpacing: '0.02em' }}>
          Resume Master
        </span>
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: 900,
          letterSpacing: '-0.03em',
        }}
      >
        Beat the ATS. Land the interview.
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 28,
          opacity: 0.88,
          maxWidth: 820,
          lineHeight: 1.35,
        }}
      >
        Free resume scan against hiring-system patterns—then refine in the
        builder.
      </div>
    </div>
  )
}
