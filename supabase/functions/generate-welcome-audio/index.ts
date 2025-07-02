import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Restrictive CORS headers - only allow specific origins
const getAllowedOrigins = () => {
  const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;
  if (isDev) {
    return ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];
  }
  // Add your production domains here
  return ['https://your-domain.com', 'https://your-app.lovable.app'];
};

const corsHeaders = (origin: string) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.endsWith('.lovable.app'));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

const validateInput = (input: any): { text?: string; error?: string } => {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request format' };
  }
  
  const { text } = input;
  
  if (!text || typeof text !== 'string') {
    return { error: 'Text is required and must be a string' };
  }
  
  if (text.length > 4096) {
    return { error: 'Text must be 4096 characters or less' };
  }
  
  // Basic content filtering
  const forbiddenPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  if (forbiddenPatterns.some(pattern => pattern.test(text))) {
    return { error: 'Invalid content detected' };
  }
  
  return { text: text.trim() };
};

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const headers = corsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    const { text, error } = validateInput(body);
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});