
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskFilter, TaskSort } from '../types/task';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('date');
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('useTasks: useEffect triggered', { currentUser: !!currentUser, uid: currentUser?.uid });
    
    if (!currentUser) {
      console.log('useTasks: No current user, clearing tasks');
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log('useTasks: Setting up Firestore listener for user:', currentUser.uid);

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('useTasks: Firestore snapshot received, docs count:', snapshot.docs.length);
        
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || undefined,
        })) as Task[];
        
        console.log('useTasks: Processed tasks:', tasksData);
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error('useTasks: Firestore error:', error);
        console.error('useTasks: Error code:', error.code);
        console.error('useTasks: Error message:', error.message);
        
        if (error.code === 'permission-denied') {
          toast.error('Erro de permissões. Verifique as regras do Firestore.');
          console.log('useTasks: Permission denied - Firestore rules need to be configured');
        } else {
          toast.error('Erro ao carregar tarefas: ' + error.message);
        }
        
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) return;

    try {
      console.log('useTasks: Adding task for user:', currentUser.uid);
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
      });
      toast.success('Tarefa adicionada com sucesso!');
    } catch (error: any) {
      console.error('useTasks: Error adding task:', error);
      toast.error('Erro ao adicionar tarefa: ' + error.message);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('useTasks: Updating task:', taskId);
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        dueDate: updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null,
      });
      toast.success('Tarefa atualizada!');
    } catch (error: any) {
      console.error('useTasks: Error updating task:', error);
      toast.error('Erro ao atualizar tarefa: ' + error.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('useTasks: Deleting task:', taskId);
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success('Tarefa eliminada!');
    } catch (error: any) {
      console.error('useTasks: Error deleting task:', error);
      toast.error('Erro ao eliminar tarefa: ' + error.message);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed });
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return {
    tasks: sortedTasks,
    loading,
    filter,
    sort,
    setFilter,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  };
}
