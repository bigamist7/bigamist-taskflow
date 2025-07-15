
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, SortAsc } from 'lucide-react';
import { TaskFilter, TaskSort } from '../../types/task';

interface TaskFiltersProps {
  filter: TaskFilter;
  sort: TaskSort;
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export function TaskFilters({ filter, sort, onFilterChange, onSortChange, taskCounts }: TaskFiltersProps) {
  const filterOptions = [
    { value: 'all' as TaskFilter, label: 'Todas', count: taskCounts.all },
    { value: 'active' as TaskFilter, label: 'Por Fazer', count: taskCounts.active },
    { value: 'completed' as TaskFilter, label: 'Concluídas', count: taskCounts.completed },
  ];

  const sortOptions = [
    { value: 'date' as TaskSort, label: 'Data' },
    { value: 'priority' as TaskSort, label: 'Prioridade' },
    { value: 'title' as TaskSort, label: 'Título' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className="relative"
          >
            {option.label}
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 min-w-[20px] text-xs"
            >
              {option.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Ordenar:</span>
        <Select value={sort} onValueChange={onSortChange}>
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
      </div>
    </div>
  );
}
