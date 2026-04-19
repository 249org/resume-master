'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { JOB_TYPES, JOB_TYPE_CATEGORIES } from '@/lib/job-types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

export function JobTypeCombobox({
  value,
  onChange,
  compact = false,
  id,
}: {
  value: string
  onChange: (v: string) => void
  compact?: boolean
  id?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = JOB_TYPES.find((j) => j.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between font-normal',
            compact ? 'h-8 gap-1.5 px-2.5 text-xs' : 'h-11 w-full gap-2 text-sm'
          )}
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : 'Search job titles…'}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search job titles…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {JOB_TYPE_CATEGORIES.map((cat) => (
              <CommandGroup key={cat} heading={cat}>
                {JOB_TYPES.filter((j) => j.category === cat).map((job) => (
                  <CommandItem
                    key={job.id}
                    value={job.label}
                    onSelect={() => {
                      onChange(job.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === job.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {job.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
