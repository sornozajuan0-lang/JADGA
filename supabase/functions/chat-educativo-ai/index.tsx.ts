import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, subject, conversationId, childName } = await req.json();

    // Obtener la API Key de OpenAI desde los secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY no está configurada');
      return new Response(
        JSON.stringify({ 
          error: 'La API Key de OpenAI no está configurada',
          details: 'Ve a Supabase Dashboard → Edge Functions → Secrets y agrega OPENAI_API_KEY'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ API Key encontrada');

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener historial de conversación si existe
    let conversationHistory = [];
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();
      
      if (conversation?.messages) {
        conversationHistory = conversation.messages;
      }
    }

    // Definir el contexto según la materia
    const subjectContexts: Record<string, string> = {
      matematica: `Eres un tutor de matemáticas amigable y paciente para niños de 6-12 años. Explicas conceptos matemáticos de forma simple, usando ejemplos cotidianos y emojis. Ayudas con sumas, restas, multiplicaciones, divisiones, fracciones, geometría básica y problemas matemáticos.`,
      lenguaje: `Eres un tutor de lenguaje y lectura amigable para niños de 6-12 años. Ayudas con gramática, ortografía, comprensión lectora, vocabulario y escritura creativa. Usas ejemplos divertidos y emojis para hacer el aprendizaje más entretenido.`,
      ciencias: `Eres un tutor de ciencias naturales entusiasta para niños de 6-12 años. Explicas conceptos de biología, física, química y ciencias de la tierra de forma simple y fascinante. Usas ejemplos del mundo real y emojis para hacer la ciencia divertida.`,
      sociales: `Eres un tutor de ciencias sociales amigable para niños de 6-12 años. Ayudas a entender historia, geografía, cultura y sociedad de forma interesante. Usas historias, ejemplos y emojis para hacer el aprendizaje más atractivo.`
    };

    const systemPrompt = subjectContexts[subject] || subjectContexts.matematica;
    const userGreeting = childName ? `El estudiante se llama ${childName}. ` : '';

    // Preparar mensajes para OpenAI
    const messages = [
      {
        role: 'system',
        content: `${systemPrompt} ${userGreeting}Siempre responde en español de forma clara, amigable y educativa. Usa emojis ocasionalmente para hacer tus respuestas más atractivas. Mantén tus respuestas concisas pero completas.`
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('📤 Enviando petición a OpenAI...');

    // Llamar a la API de OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('📥 Respuesta de OpenAI:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('❌ Error de OpenAI:', JSON.stringify(errorData, null, 2));
      
      let errorMessage = 'Error al comunicarse con OpenAI';
      let errorDetails = '';
      
      if (errorData.error?.code === 'insufficient_quota') {
        errorMessage = 'Tu cuenta de OpenAI no tiene créditos';
        errorDetails = 'Agrega créditos en https://platform.openai.com/account/billing';
      } else if (errorData.error?.code === 'invalid_api_key') {
        errorMessage = 'La API Key de OpenAI es inválida';
        errorDetails = 'Verifica que copiaste correctamente la API Key';
      } else if (errorData.error?.message) {
        errorDetails = errorData.error.message;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorDetails,
          status: openaiResponse.status,
          fullError: errorData
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ Respuesta generada exitosamente');

    // Actualizar historial de conversación
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    // Guardar en Supabase
    if (conversationId) {
      await supabase
        .from('chat_conversations')
        .update({ 
          messages: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } else {
      const { data: newConversation } = await supabase
        .from('chat_conversations')
        .insert({
          subject: subject,
          messages: updatedHistory,
          user_name: childName || 'Estudiante'
        })
        .select()
        .single();
      
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          conversationId: newConversation.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        conversationId: conversationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error general:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});