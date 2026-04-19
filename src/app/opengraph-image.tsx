import { ImageResponse } from 'next/og'
import { OgShareInner } from './og-share-inner'

export const runtime = 'edge'

export const alt = 'Resume Master — ATS resume checker and builder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(<OgShareInner />, { ...size })
}
