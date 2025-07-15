
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle, Clock, AlertTriangle, AlertCircle, TrendingUp, Target, Calendar } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskItem } from '../components/Tasks/TaskItem';
import { TaskFilters } from '../components/Tasks/TaskFilters';
import { AdvancedChatbotWidget } from '../components/Chatbot/AdvancedChatbotWidget';
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

  console.log('🏠 Dashboard: Render state', { 
    loading, 
    tasksCount: tasks.length, 
    currentUser: !!currentUser,
    uid: currentUser?.uid,
    email: currentUser?.email
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
  };

  const handleAddTask = async (taskData: any) => {
    console.log('🏠 Dashboard: handleAddTask called with:', taskData);
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
              
              {/* Informação de Debug Melhorada */}
              <div className="mt-6 p-4 bg-muted/50 backdrop-blur-sm rounded-xl text-sm text-left max-w-lg border border-border/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  <AlertCircle className="h-4 w-4" />
                  Estado de Debug
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {currentUser ? (
                      <CheckCircle className="h-4 w-4 text-secondary" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>Utilizador: {currentUser?.email || 'Não autenticado'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {currentUser?.uid ? (
                      <CheckCircle className="h-4 w-4 text-secondary" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>UID: {currentUser?.uid || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Conexão Firestore: A tentar conectar...</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-destructive text-xs font-medium">
                    ⚠️ Se isto não carregar, as regras do Firestore precisam de ser configuradas!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verifique o console do navegador (F12) para mais detalhes.
                  </p>
                </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta! 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo das suas tarefas hoje
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{taskCounts.all}</div>
              <p className="text-xs text-muted-foreground">
                {taskCounts.completed} concluídas
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-secondary/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Fazer</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{taskCounts.active}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas pendentes
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Para Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas agendadas
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Precisam atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {taskCounts.all > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-accent/20 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Progresso Geral
                </h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round((taskCounts.completed / taskCounts.all) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(taskCounts.completed / taskCounts.all) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Task Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">As Minhas Tarefas</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-soft">
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
            <Card className="text-center py-12 bg-gradient-to-br from-accent/10 to-transparent">
              <CardContent>
                <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {filter === 'all' 
                    ? 'Comece por adicionar a sua primeira tarefa e organize o seu dia de forma eficiente!'
                    : `Não há tarefas ${filter === 'active' ? 'por fazer' : 'concluídas'}.`
                  }
                </p>
                {filter === 'all' && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="shadow-soft">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Primeira Tarefa
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="animate-slide-up">
                  <TaskItem
                    task={task}
                    onToggle={toggleTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AdvancedChatbotWidget />
    </div>
  );
}
