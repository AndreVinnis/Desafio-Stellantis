import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TableSkeleton({ columns, rows = 5 }: { columns: string[]; rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-md border" aria-busy="true" aria-label="Carregando">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={c}>
                  <Skeleton className="h-4 w-full min-w-12" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
