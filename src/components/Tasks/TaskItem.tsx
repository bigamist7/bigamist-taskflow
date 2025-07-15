
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit3, Trash2, Calendar, Tag, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Task, TaskStatus } from '../../types/task';
import { TaskForm } from './TaskForm';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const priorityColors = {
    baixa: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const priorityLabels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta'
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;

  const handleUpdate = async (updates: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    onEdit({ ...task, ...updates });
    setIsEditDialogOpen(false);
  };

  const handleStatusToggle = (checked: boolean) => {
    const newStatus: TaskStatus = checked ? 'concluida' : 'por-fazer';
    onStatusChange(task.id, newStatus);
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-70",
      isOverdue && "border-red-300 dark:border-red-700"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleStatusToggle}
            className="mt-1"
            aria-label={`Marcar "${task.title}" como ${task.completed ? 'não concluída' : 'concluída'}`}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h3 className={cn(
                "font-medium text-sm sm:text-base flex-1 min-w-0",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              
              <div className="flex gap-1">
                <Badge variant="secondary" className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
                
                {task.category && (
                  <Badge variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {task.category}
                  </Badge>
                )}
              </div>
            </div>

            {task.description && (
              <p className={cn(
                "text-sm text-muted-foreground mb-2",
                task.completed && "line-through"
              )}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-red-600 dark:text-red-400 font-medium"
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(task.dueDate, "dd/MM/yyyy", { locale: pt })}
                    {isOverdue && " (Atrasada)"}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{format(task.createdAt, "dd/MM/yyyy", { locale: pt })}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit3 className="h-4 w-4" />
                  <span className="sr-only">Editar tarefa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Tarefa</DialogTitle>
                </DialogHeader>
                <TaskForm
                  onSubmit={handleUpdate}
                  initialData={task}
                  submitLabel="Guardar Alterações"
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar tarefa</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar Tarefa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem a certeza que pretende eliminar "{task.title}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
