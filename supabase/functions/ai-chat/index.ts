
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, provider } = await req.json();

    console.log('AI Chat request:', { message, provider });

    let response;
    let responseText;

    if (provider === 'openai') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY2');
      if (!openaiKey) {
        throw new Error('OpenAI API key not configured');
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    } else if (provider === 'perplexity') {
      const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY2');
      if (!perplexityKey) {
        throw new Error('Perplexity API key not configured');
      }

      response = await fetch('https://api.perplexity.ai/chat/completions', {
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
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    } else {
      // Local responses for basic functionality
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
          responseText = response;
          break;
        }
      }
      
      if (!responseText) {
        responseText = 'Desculpe, não entendi. Para funcionalidades avançadas, configure as chaves de IA nas configurações do Supabase!';
      }
    }

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      text: `Erro: ${error.message}. A usar resposta local como alternativa.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
