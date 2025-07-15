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
    console.log('🔥 useTasks: useEffect triggered', { 
      currentUser: !!currentUser, 
      uid: currentUser?.uid,
      email: currentUser?.email 
    });
    
    if (!currentUser) {
      console.log('❌ useTasks: No current user, clearing tasks');
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log('🔗 useTasks: Setting up Firestore listener for user:', currentUser.uid);

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('✅ useTasks: Firestore snapshot received');
        console.log('📊 Snapshot details:', {
          docsCount: snapshot.docs.length,
          metadata: snapshot.metadata,
          fromCache: snapshot.metadata.fromCache,
          hasPendingWrites: snapshot.metadata.hasPendingWrites
        });
        
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 Processing doc:', { id: doc.id, data });
          
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate() || undefined,
          };
        }) as Task[];
        
        console.log('✨ useTasks: Final processed tasks:', tasksData);
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error('💥 useTasks: Firestore error:', error);
        console.error('🔍 Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        if (error.code === 'permission-denied') {
          toast.error('❌ Erro de permissões no Firestore. Verifique as regras de segurança.');
          console.log('🚫 FIRESTORE RULES PROBLEM: As regras do Firestore não permitem acesso aos dados');
        } else if (error.code === 'failed-precondition') {
          toast.error('❌ Firestore: Índice em falta ou configuração incorreta.');
        } else {
          toast.error('❌ Erro ao carregar tarefas: ' + error.message);
        }
        
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) {
      console.error('❌ addTask: No current user');
      toast.error('❌ Utilizador não autenticado');
      return;
    }

    console.log('➕ useTasks: Adding task for user:', currentUser.uid);
    console.log('📝 Task data to add:', taskData);

    try {
      const docData = {
        ...taskData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
      };
      
      console.log('💾 Final document data:', docData);
      
      const docRef = await addDoc(collection(db, 'tasks'), docData);
      console.log('✅ Task added successfully with ID:', docRef.id);
      toast.success('✅ Tarefa adicionada com sucesso!');
    } catch (error: any) {
      console.error('💥 useTasks: Error adding task:', error);
      console.error('🔍 Add error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        toast.error('❌ Sem permissão para adicionar tarefas. Verifique as regras do Firestore.');
      } else {
        toast.error('❌ Erro ao adicionar tarefa: ' + error.message);
      }
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('📝 useTasks: Updating task:', taskId, updates);
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        dueDate: updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null,
      });
      console.log('✅ Task updated successfully');
      toast.success('✅ Tarefa atualizada!');
    } catch (error: any) {
      console.error('💥 useTasks: Error updating task:', error);
      toast.error('❌ Erro ao atualizar tarefa: ' + error.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('🗑️ useTasks: Deleting task:', taskId);
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Task deleted successfully');
      toast.success('✅ Tarefa eliminada!');
    } catch (error: any) {
      console.error('💥 useTasks: Error deleting task:', error);
      toast.error('❌ Erro ao eliminar tarefa: ' + error.message);
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
