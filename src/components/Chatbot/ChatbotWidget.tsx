
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
  provider?: string;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o seu assistente inteligente. Pergunto automaticamente ao modelo mais adequado para cada questão!',
      isBot: true,
      timestamp: new Date(),
      provider: 'local',
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

  const detectBestProvider = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Palavras-chave para perguntas que precisam de informação atualizada/web
    const webKeywords = [
      'notícias', 'atual', 'recente', 'hoje', 'ontem', 'esta semana', 'este mês',
      'preço', 'cotação', 'bolsa', 'mercado', 'stock', 'ações',
      'tempo', 'clima', 'temperatura', 'chuva', 'sol',
      'eventos', 'acontecimentos', 'últimas', 'breaking news',
      'quem é', 'biografia', 'vida de', 'carreira de',
      'quando aconteceu', 'data de', 'quando foi',
      'onde fica', 'localização', 'endereço',
      'pesquisar', 'procurar', 'encontrar informação',
      'verificar', 'confirmar', 'validar',
      'presidente', 'governo', 'política atual', 'eleições',
      'covid', 'pandemia', 'vacina', 'saúde pública',
      'guerra', 'conflito', 'internacional'
    ];

    // Palavras-chave para tarefas básicas locais
    const localKeywords = [
      'organizar', 'filtros', 'filtrar', 'adicionar', 'criar', 'nova tarefa',
      'editar', 'modificar', 'alterar', 'eliminar', 'apagar', 'remover',
      'ajuda', 'help', 'como usar', 'tutorial', 'explicar',
      'prioridade', 'categoria', 'data limite', 'completar',
      'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite',
      'obrigado', 'obrigada', 'tchau', 'adeus',
      'taskflow', 'tarefas', 'lista', 'to-do'
    ];

    // Verifica se é uma pergunta sobre web/informação atual
    const hasWebKeywords = webKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Verifica se é uma pergunta básica sobre tarefas
    const hasLocalKeywords = localKeywords.some(keyword => lowerMessage.includes(keyword));

    // Perguntas que sugerem necessidade de informação web atual
    const webPatterns = [
      /qual.*preço/,
      /quanto custa/,
      /o que aconteceu/,
      /últimas notícias/,
      /quem ganhou/,
      /resultado.*jogo/,
      /quando.*vai.*acontecer/,
      /onde.*fica/,
      /como.*chegar/
    ];

    const hasWebPatterns = webPatterns.some(pattern => pattern.test(lowerMessage));

    // Se tem palavras-chave de web ou padrões de web, usa Perplexity
    if (hasWebKeywords || hasWebPatterns) {
      return 'perplexity';
    }

    // Se tem palavras-chave locais, usa local
    if (hasLocalKeywords) {
      return 'local';
    }

    // Para perguntas complexas ou criativas, usa OpenAI
    const complexPatterns = [
      /explica.*como/,
      /diferença.*entre/,
      /vantagens.*desvantagens/,
      /pros.*contras/,
      /escreve.*texto/,
      /cria.*história/,
      /traduz/,
      /resumo/,
      /análise/,
      /comparação/,
      /estratégia/,
      /plano/,
      /sugestões.*melhorar/
    ];

    const isComplexQuestion = complexPatterns.some(pattern => pattern.test(lowerMessage));
    
    if (isComplexQuestion || lowerMessage.length > 100) {
      return 'openai';
    }

    // Default para local para perguntas simples
    return 'local';
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'perplexity':
        return '🌐';
      case 'local':
      default:
        return '💡';
    }
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'perplexity':
        return 'Perplexity';
      case 'local':
      default:
        return 'Local';
    }
  };

  const getBotResponse = async (message: string): Promise<{ text: string; provider: string }> => {
    const selectedProvider = detectBestProvider(message);
    
    try {
      console.log(`🔄 Auto-selecionado: ${selectedProvider} para: "${message}"`);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          provider: selectedProvider,
        },
      });

      if (error) {
        console.error('❌ Erro na função Supabase:', error);
        throw new Error(error.message || 'Erro na chamada da função');
      }

      console.log('✅ Resposta da IA:', data);
      return { 
        text: data.text || 'Desculpe, não consegui gerar uma resposta.', 
        provider: selectedProvider 
      };
    } catch (error) {
      console.error('❌ Erro do provedor de IA:', error);
      
      // Fallback para respostas locais
      const responseMap = {
        organizar: 'Recomendo organizar as suas tarefas por prioridade! Use as etiquetas "Alta", "Média" e "Baixa" e defina datas limite para as mais importantes.',
        prioridade: 'Para definir prioridades, clique numa tarefa e seleccione entre "Alta", "Média" ou "Baixa" prioridade.',
        filtros: 'Pode filtrar as suas tarefas por: "Todas", "Por Fazer" ou "Concluídas". Use também a ordenação por data, prioridade ou título.',
        adicionar: 'Para adicionar uma nova tarefa, clique no botão "Nova Tarefa", preencha o título (obrigatório), descrição, prioridade e categoria.',
        editar: 'Para editar uma tarefa, clique no ícone do lápis na tarefa que pretende modificar.',
        eliminar: 'Para eliminar uma tarefa, clique no ícone do lixo e confirme a ação.',
        ajuda: 'Posso ajudar com: organização de tarefas, filtros, adição/edição/eliminação de tarefas, e dicas de produtividade!',
        olá: 'Olá! Como posso ajudá-lo hoje com as suas tarefas?',
        obrigado: 'De nada! Estou aqui para ajudar sempre que precisar.',
      };

      for (const [keyword, response] of Object.entries(responseMap)) {
        if (lowerMessage.includes(keyword)) {
          return { text: response, provider: 'local' };
        }
      }
      
      return { 
        text: 'Desculpe, não entendi a sua pergunta. Pode perguntar sobre: organização de tarefas, filtros, como adicionar/editar tarefas, ou pedir ajuda geral.', 
        provider: 'local' 
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const { text: botResponseText, provider } = await getBotResponse(currentMessage);
      
      const botResponse: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
        provider,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        isBot: true,
        timestamp: new Date(),
        provider: 'local',
      };
      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
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
          aria-label="Abrir assistente inteligente"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Assistente IA Auto</CardTitle>
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
                      {message.isBot && message.provider && (
                        <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                          <span>{getProviderIcon(message.provider)}</span>
                          <span>{getProviderName(message.provider)}</span>
                        </div>
                      )}
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm">
                      <div className="animate-pulse">A analisar e a pensar...</div>
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
                placeholder="Pergunte qualquer coisa..."
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
