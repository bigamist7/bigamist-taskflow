import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Flag, CheckCircle, Circle, Search } from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskItem } from '@/components/Tasks/TaskItem';
import { TaskFilters } from '@/components/Tasks/TaskFilters';
import { Header } from '@/components/Layout/Header';
import { ChatbotWidget } from '@/components/Chatbot/ChatbotWidget';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

export function Dashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'TaskFlow - Dashboard';
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
      toast({
        title: "Tarefa criada",
        description: "A sua nova tarefa foi criada com sucesso!",
        className: "bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white border-green-400/20",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowTaskForm(false);
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram guardadas com sucesso!",
        className: "bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white border-blue-400/20",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Tarefa eliminada",
        description: "A tarefa foi removida com sucesso!",
        className: "bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white border-red-400/20",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const completed = status === 'concluida';
    updateTask(taskId, { status, completed });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'concluida').length;
    const pending = tasks.filter(task => task.status === 'por-fazer').length;
    const highPriority = tasks.filter(task => task.priority === 'alta' && task.status !== 'concluida').length;
    
    return { total, completed, pending, highPriority };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar as suas tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 dark:from-blue-950 dark:via-green-950 dark:to-cyan-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-red-200/50 dark:border-red-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-md">
                  <Flag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prioridade Alta</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="glass-effect border-blue-200/50 dark:border-blue-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                Todas as Tarefas
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                Activas
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                Concluídas
              </TabsTrigger>
            </TabsList>
            
            <Button
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>

          <TaskFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <TabsContent value="all" className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card className="glass-effect border-blue-200/50 dark:border-blue-800/50">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-10 w-10 text-blue-500" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Nenhuma tarefa encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                      ? 'Ajuste os filtros ou crie uma nova tarefa.'
                      : 'Comece por criar a sua primeira tarefa!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredTasks.filter(task => task.status === 'por-fazer').length === 0 ? (
              <Card className="glass-effect border-green-200/50 dark:border-green-800/50">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Circle className="h-10 w-10 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Nenhuma tarefa activa</p>
                  <p className="text-sm text-muted-foreground">Todas as suas tarefas estão concluídas!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.filter(task => task.status === 'por-fazer').map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredTasks.filter(task => task.status === 'concluida').length === 0 ? (
              <Card className="glass-effect border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-purple-500" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Nenhuma tarefa concluída</p>
                  <p className="text-sm text-muted-foreground">Complete algumas tarefas para vê-las aqui!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.filter(task => task.status === 'concluida').map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {showTaskForm && (
        <TaskForm
          initialData={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <ChatbotWidget />
    </div>
  );
}
