import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Table2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  unit?: string;
  decimals?: number;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title: string;
  pageSize?: number;
}

export default function DataTable({ data, columns, title, pageSize = 15 }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(d =>
      columns.some(c => String(d[c.key]).toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, columns, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            {title}
          </span>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}{col.unit && <span className="text-[10px]">({col.unit})</span>}
                      <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? 'text-foreground' : 'text-muted-foreground/40'}`} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="py-1.5 px-2 tabular-nums">
                      {typeof row[col.key] === 'number' ? row[col.key].toFixed(col.decimals ?? 2) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{sorted.length} rows — page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
