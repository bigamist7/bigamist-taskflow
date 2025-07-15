
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o seu assistente de tarefas. Como posso ajudar?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const getBotResponse = async (message: string): Promise<string> => {
    try {
      console.log('Calling AI chat function with:', { message, provider: 'local' });
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          provider: 'local',
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro na chamada da função');
      }

      console.log('AI chat response:', data);
      return data.text || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('AI Provider Error:', error);
      
      // Fallback to local responses
      const responseMap = {
        // Task organization keywords
        organizar: 'Recomendo organizar as suas tarefas por prioridade! Use as etiquetas "Alta", "Média" e "Baixa" e defina datas limite para as mais importantes.',
        prioridade: 'Recomendo organizar as suas tarefas por prioridade! Use as etiquetas "Alta", "Média" e "Baixa" e defina datas limite para as mais importantes.',
        prioridades: 'Recomendo organizar as suas tarefas por prioridade! Use as etiquetas "Alta", "Média" e "Baixa" e defina datas limite para as mais importantes.',
        
        // Filter keywords
        filtros: 'Pode filtrar as suas tarefas por: "Todas", "Por Fazer" ou "Concluídas". Use também a ordenação por data, prioridade ou título.',
        filtrar: 'Pode filtrar as suas tarefas por: "Todas", "Por Fazer" ou "Concluídas". Use também a ordenação por data, prioridade ou título.',
        ordenar: 'Pode filtrar as suas tarefas por: "Todas", "Por Fazer" ou "Concluídas". Use também a ordenação por data, prioridade ou título.',
        
        // Add task keywords
        adicionar: 'Para adicionar uma nova tarefa, clique no botão "Nova Tarefa", preencha o título (obrigatório), descrição, prioridade e categoria.',
        criar: 'Para adicionar uma nova tarefa, clique no botão "Nova Tarefa", preencha o título (obrigatório), descrição, prioridade e categoria.',
        nova: 'Para adicionar uma nova tarefa, clique no botão "Nova Tarefa", preencha o título (obrigatório), descrição, prioridade e categoria.',
        
        // Edit task keywords
        editar: 'Para editar uma tarefa, clique no ícone do lápis na tarefa que pretende modificar.',
        modificar: 'Para editar uma tarefa, clique no ícone do lápis na tarefa que pretende modificar.',
        alterar: 'Para editar uma tarefa, clique no ícone do lápis na tarefa que pretende modificar.',
        
        // Delete task keywords
        eliminar: 'Para eliminar uma tarefa, clique no ícone do lixo e confirme a ação.',
        apagar: 'Para eliminar uma tarefa, clique no ícone do lixo e confirme a ação.',
        remover: 'Para eliminar uma tarefa, clique no ícone do lixo e confirme a ação.',
        
        // Help keywords
        ajuda: 'Posso ajudar com: organização de tarefas, uso de filtros, adição/edição/eliminação de tarefas, e dicas de produtividade!',
        help: 'Posso ajudar com: organização de tarefas, uso de filtros, adição/edição/eliminação de tarefas, e dicas de produtividade!',
        
        // Productivity keywords
        produtividade: 'Dicas de produtividade: 1) Defina prioridades claras, 2) Use a técnica Pomodoro, 3) Organize tarefas por categoria, 4) Defina datas limite realistas.',
        dicas: 'Dicas de produtividade: 1) Defina prioridades claras, 2) Use a técnica Pomodoro, 3) Organize tarefas por categoria, 4) Defina datas limite realistas.',
        
        // Greetings
        olá: 'Olá! Como posso ajudá-lo hoje com as suas tarefas?',
        ola: 'Olá! Como posso ajudá-lo hoje com as suas tarefas?',
        bom: 'Olá! Como posso ajudá-lo hoje com as suas tarefas?',
        obrigado: 'De nada! Estou aqui para ajudar sempre que precisar.',
        obrigada: 'De nada! Estou aqui para ajudar sempre que precisar.',
      };

      const lowerMessage = message.toLowerCase();
      
      // Check each keyword in the response map
      for (const [keyword, response] of Object.entries(responseMap)) {
        if (lowerMessage.includes(keyword)) {
          return response;
        }
      }
      
      // Default response if no keywords match
      return 'Desculpe, não entendi a sua pergunta. Pode perguntar sobre: organização de tarefas, filtros, como adicionar/editar tarefas, ou pedir ajuda geral.';
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponseText = await getBotResponse(inputMessage);
      
      const botResponse: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform"
          aria-label="Abrir chat de ajuda"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Assistente TaskFlow</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col flex-1 p-4 pt-0 overflow-hidden">
            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-3 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm break-words ${
                        message.isBot
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm">
                      <div className="animate-pulse">A pensar...</div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 flex-shrink-0">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite a sua pergunta..."
                className="flex-1"
                autoComplete="off"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                size="icon"
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
