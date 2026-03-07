'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Upload,
} from '@/components/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status'
import PageTitle from '@/components/page-title'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'

type ResumeStatus = 'Optimized' | 'Processing' | 'Archived' | 'Draft'

interface ResumeRow {
  id: number
  name: string
  targeting: string
  date: string
  score: number | null
  status: ResumeStatus
}

const allResumes: ResumeRow[] = [
  { id: 1, name: 'Software Engineer V2', targeting: 'Senior Backend Role', date: 'Oct 24, 2023', score: 92, status: 'Optimized' },
  { id: 2, name: 'Product Manager Draft', targeting: 'FinTech Startups', date: 'Oct 20, 2023', score: 65, status: 'Processing' },
  { id: 3, name: 'Base Resume 2023', targeting: 'General Template', date: 'Sept 15, 2023', score: null, status: 'Archived' },
  { id: 4, name: 'Frontend Specialist', targeting: 'React/Vue roles', date: 'Aug 10, 2023', score: 88, status: 'Optimized' },
  { id: 5, name: 'Creative Portfolio Link', targeting: 'Experimental Layout', date: 'July 02, 2023', score: 72, status: 'Draft' },
  { id: 6, name: 'DevOps Engineer', targeting: 'Cloud Infrastructure', date: 'June 18, 2023', score: 79, status: 'Optimized' },
  { id: 7, name: 'ML Engineer Resume', targeting: 'AI/ML roles', date: 'May 30, 2023', score: 85, status: 'Optimized' },
  { id: 8, name: 'Startup Generalist', targeting: 'Early Stage Startups', date: 'May 12, 2023', score: 61, status: 'Draft' },
]

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-foreground text-sm">--</span>
  let bg = 'bg-primary'
  if (score < 60) bg = 'bg-destructive'
  else if (score < 80) bg = 'bg-primary/70'
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${bg}`}
    >
      {score}
    </div>
  )
}

function StatusBadge({ status }: { status: ResumeStatus }) {
  const map: Record<ResumeStatus, 'online' | 'maintenance' | 'offline' | 'degraded'> = {
    Optimized: 'online',
    Processing: 'degraded',
    Archived: 'offline',
    Draft: 'maintenance',
  }
  return (
    <Status status={map[status]}>
      <StatusIndicator />
      <StatusLabel>{status}</StatusLabel>
    </Status>
  )
}

const PAGE_SIZE = 5

export default function AnalyzerHistoryPage() {
  const params = useParams()
  const userId = params.id as string
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])

  const filtered = allResumes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.targeting.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selected.length === paginated.length) {
      setSelected([])
    } else {
      setSelected(paginated.map((r) => r.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <BillingBreadcrumb />
      <div className="flex items-start justify-between">
        <PageTitle
          title="Resume History"
          subtitle="Track versions, scores, and optimization status of your generated resumes."
        />
        <Status status="online">
          <StatusIndicator />
          <StatusLabel />
        </Status>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="text-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search resumes by name, role, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-3 w-3" /> Add Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-3 w-3" /> Last 30 Days
          </Button>
          <Button size="sm" className="gap-1" asChild>
            <Link href={`/users/${userId}/job-match`}>
              <Upload className="h-3 w-3" /> New Upload
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-accent overflow-hidden p-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="[&>*]:text-secondary sticky mb-10 rounded-lg [&>*]:text-lg [&>*]:font-bold">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Resume Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((resume) => (
                <TableRow
                  key={resume.id}
                  className={selected.includes(resume.id) ? 'bg-background/50' : ''}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selected.includes(resume.id)}
                      onCheckedChange={() => toggleSelect(resume.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-secondary font-medium">{resume.name}</p>
                    <p className="text-foreground text-xs">
                      Targeting: {resume.targeting}
                    </p>
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {resume.date}
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={resume.score} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={resume.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-3 w-3" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-3 w-3" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive gap-2">
                          <Trash2 className="h-3 w-3" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-foreground py-10 text-center">
                    No resumes found. Try a different search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-foreground">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} to{' '}
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} resumes
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
