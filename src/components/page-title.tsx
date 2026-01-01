import React from 'react'

export default function PageTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div>
      <h1 className="text-secondary mb-2 text-4xl font-bold">{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}
