
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Settings, Bot, Globe, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AIProvider = 'local' | 'openai' | 'perplexity';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  provider?: AIProvider;
}

export function AdvancedChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('local');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o seu assistente inteligente. Escolha o modo de IA nas configurações para funcionalidades avançadas!',
      isBot: true,
      timestamp: new Date(),
      provider: 'local',
    },
  ]);

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
    if (isOpen && inputRef.current && !showSettings) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showSettings]);

  const getBotResponse = async (message: string): Promise<string> => {
    try {
      console.log('Calling AI chat function with:', { message, provider: aiProvider });
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          provider: aiProvider,
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
      toast({
        title: "Erro de IA",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      // Fallback to local response
      const localResponses = {
        organizar: 'Recomendo organizar as suas tarefas por prioridade! Use as etiquetas "Alta", "Média" e "Baixa" e defina datas limite.',
        filtros: 'Pode filtrar as suas tarefas por: "Todas", "Por Fazer" ou "Concluídas". Use também a ordenação por data ou prioridade.',
        adicionar: 'Para adicionar uma nova tarefa, clique no botão "Nova Tarefa" e preencha os campos obrigatórios.',
        editar: 'Para editar uma tarefa, clique no ícone do lápis na tarefa que pretende modificar.',
        eliminar: 'Para eliminar uma tarefa, clique no ícone do lixo e confirme a ação.',
        ajuda: 'Posso ajudar com: organização de tarefas, filtros, adição/edição/eliminação de tarefas, e muito mais com IA!',
        olá: 'Olá! Como posso ajudá-lo hoje?',
        obrigado: 'De nada! Estou aqui para ajudar sempre que precisar.',
      };

      const lowerMessage = message.toLowerCase();
      
      for (const [keyword, response] of Object.entries(localResponses)) {
        if (lowerMessage.includes(keyword)) {
          return response;
        }
      }
      
      return 'Erro na conexão. Para funcionalidades avançadas, verifique se as chaves de API estão configuradas no Supabase.';
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
        provider: aiProvider,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        isBot: true,
        timestamp: new Date(),
        provider: 'local',
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

  const getProviderIcon = (provider?: AIProvider) => {
    switch (provider) {
      case 'openai':
        return <Sparkles className="h-3 w-3 text-green-500" />;
      case 'perplexity':
        return <Globe className="h-3 w-3 text-blue-500" />;
      default:
        return <Bot className="h-3 w-3 text-gray-500" />;
    }
  };

  const getProviderStatus = (provider: AIProvider) => {
    switch (provider) {
      case 'local':
        return '• Respostas básicas sobre tarefas';
      case 'openai':
        return '• IA avançada (configurar no Supabase)';
      case 'perplexity':
        return '• IA com web (configurar no Supabase)';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform"
          aria-label="Abrir assistente IA"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Assistente IA
                {getProviderIcon(aiProvider)}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  aria-label="Configurações"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col flex-1 p-4 pt-0">
            {showSettings ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">Modo de IA</Label>
                  <Select value={aiProvider} onValueChange={(value: AIProvider) => setAiProvider(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local (Básico)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                      <SelectItem value="perplexity">Perplexity (Web)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {getProviderStatus(aiProvider)}
                </div>

                {aiProvider !== 'local' && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded border">
                    <p className="font-medium">⚙️ Configuração necessária</p>
                    <p className="mt-1">
                      Para usar {aiProvider === 'openai' ? 'OpenAI' : 'Perplexity'}, configure a chave API no Supabase Edge Functions Secrets.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowSettings(false)} 
                  size="sm" 
                  className="w-full"
                >
                  Fechar Configurações
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.isBot
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.isBot && getProviderIcon(message.provider)}
                          <span>{message.text}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm flex items-center gap-2">
                        {getProviderIcon(aiProvider)}
                        <div className="animate-pulse">A pensar...</div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Pergunte ao ${aiProvider === 'local' ? 'assistente local' : aiProvider}...`}
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
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
