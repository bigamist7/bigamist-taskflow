
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter, SortAsc, Search } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types/task';

interface TaskFiltersProps {
  filterStatus: TaskStatus | 'all';
  setFilterStatus: (status: TaskStatus | 'all') => void;
  filterPriority: TaskPriority | 'all';
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'date' | 'priority' | 'title';
  setSortBy: (sort: 'date' | 'priority' | 'title') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export function TaskFilters({
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: TaskFiltersProps) {
  const statusOptions = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'por-fazer' as const, label: 'Por Fazer' },
    { value: 'concluida' as const, label: 'Concluídas' },
  ];

  const priorityOptions = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'alta' as const, label: 'Alta' },
    { value: 'media' as const, label: 'Média' },
    { value: 'baixa' as const, label: 'Baixa' },
  ];

  const sortOptions = [
    { value: 'date' as const, label: 'Data' },
    { value: 'priority' as const, label: 'Prioridade' },
    { value: 'title' as const, label: 'Título' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar tarefas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Estado:</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Prioridade:</span>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Ordenar:</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
    </div>
  );
}
