import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Settings, Bot, Globe, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
  const [openaiKey, setOpenaiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
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

  const getLocalResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of Object.entries(localResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return 'Desculpe, não entendi. Para funcionalidades avançadas, configure uma chave de IA nas configurações!';
  };

  const callOpenAI = async (message: string) => {
    if (!openaiKey) {
      throw new Error('Chave OpenAI não configurada');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'És um assistente especializado em gestão de tarefas e produtividade. Responde sempre em português e de forma concisa e útil.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro OpenAI: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
  };

  const callPerplexity = async (message: string) => {
    if (!perplexityKey) {
      throw new Error('Chave Perplexity não configurada');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'És um assistente especializado em gestão de tarefas e produtividade. Responde sempre em português, de forma concisa e com informações atualizadas.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 500,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Perplexity API Error:', errorData);
      throw new Error(`Erro Perplexity: ${response.status} - ${errorData?.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
  };

  const getBotResponse = async (message: string): Promise<string> => {
    try {
      switch (aiProvider) {
        case 'openai':
          return await callOpenAI(message);
        case 'perplexity':
          return await callPerplexity(message);
        case 'local':
        default:
          return getLocalResponse(message);
      }
    } catch (error) {
      console.error('AI Provider Error:', error);
      toast({
        title: "Erro de IA",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. A usar resposta local...`;
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

  const saveApiKeys = () => {
    if (openaiKey) {
      localStorage.setItem('openai_key', openaiKey);
    }
    if (perplexityKey) {
      localStorage.setItem('perplexity_key', perplexityKey);
    }
    setShowSettings(false);
    toast({
      title: "Configurações guardadas",
      description: "As chaves de API foram guardadas localmente.",
    });
  };

  useEffect(() => {
    const savedOpenAI = localStorage.getItem('openai_key');
    const savedPerplexity = localStorage.getItem('perplexity_key');
    if (savedOpenAI) setOpenaiKey(savedOpenAI);
    if (savedPerplexity) setPerplexityKey(savedPerplexity);
  }, []);

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
              <Tabs defaultValue="provider" className="flex-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="provider">Provedor</TabsTrigger>
                  <TabsTrigger value="keys">Chaves API</TabsTrigger>
                </TabsList>
                
                <TabsContent value="provider" className="space-y-4">
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
                    {aiProvider === 'local' && '• Respostas básicas sobre tarefas'}
                    {aiProvider === 'openai' && '• IA avançada para qualquer pergunta'}
                    {aiProvider === 'perplexity' && '• IA com acesso à web em tempo real'}
                  </div>
                </TabsContent>
                
                <TabsContent value="keys" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">Chave OpenAI</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="perplexity-key">Chave Perplexity</Label>
                    <Input
                      id="perplexity-key"
                      type="password"
                      placeholder="pplx-..."
                      value={perplexityKey}
                      onChange={(e) => setPerplexityKey(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={saveApiKeys} size="sm" className="w-full">
                    Guardar Chaves
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    As chaves são guardadas localmente no seu navegador.
                  </div>
                </TabsContent>
              </Tabs>
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
