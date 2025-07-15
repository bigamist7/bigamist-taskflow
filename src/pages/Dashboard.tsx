
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskItem } from '../components/Tasks/TaskItem';
import { TaskFilters } from '../components/Tasks/TaskFilters';
import { ChatbotWidget } from '../components/Chatbot/ChatbotWidget';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  const {
    tasks,
    loading,
    filter,
    sort,
    setFilter,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  } = useTasks();

  console.log('Dashboard: Render state', { 
    loading, 
    tasksCount: tasks.length, 
    currentUser: !!currentUser,
    uid: currentUser?.uid 
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
  };

  const handleAddTask = async (taskData: any) => {
    await addTask(taskData);
    setIsAddDialogOpen(false);
  };

  const overdueTasks = tasks.filter(
    task => task.dueDate && task.dueDate < new Date() && !task.completed
  ).length;

  const todayTasks = tasks.filter(
    task => task.dueDate && 
      task.dueDate.toDateString() === new Date().toDateString() && 
      !task.completed
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">A carregar as suas tarefas...</p>
              
              {/* Debug information */}
              <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-left max-w-md">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Informações de Debug
                </h4>
                <p>Utilizador: {currentUser?.email}</p>
                <p>UID: {currentUser?.uid}</p>
                <p className="text-red-600 mt-2">
                  Se isto não carregar, provavelmente as regras do Firestore precisam de ser configuradas.
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Verifique o console do navegador para mais detalhes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCounts.all}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Fazer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCounts.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Para Hoje</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTasks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">As Minhas Tarefas</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleAddTask} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <TaskFilters
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
          taskCounts={taskCounts}
        />

        {/* Tasks List */}
        <div className="space-y-3 mt-6">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? 'Comece por adicionar a sua primeira tarefa!'
                    : `Não há tarefas ${filter === 'active' ? 'por fazer' : 'concluídas'}.`
                  }
                </p>
                {filter === 'all' && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Primeira Tarefa
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
}
