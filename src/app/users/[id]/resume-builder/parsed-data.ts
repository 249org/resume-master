export interface ParsedData {
  fullName?: string
  jobTitle?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  experiences?: Array<{
    title?: string
    company?: string
    location?: string
    startDate?: string
    endDate?: string
    description?: string
  }>
  education?: Array<{
    degree?: string
    school?: string
    year?: string
  }>
  skills?: string[]
}

export interface ParseApiResponse {
  error?: string
  data?: ParsedData
}
