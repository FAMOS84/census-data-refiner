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

const validateInput = (input: any): { prompts?: string[]; error?: string } => {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request format' };
  }
  
  const { prompts } = input;
  
  if (!Array.isArray(prompts)) {
    return { error: 'Prompts must be an array' };
  }
  
  if (prompts.length === 0 || prompts.length > 10) {
    return { error: 'Must provide 1-10 prompts' };
  }
  
  for (const prompt of prompts) {
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return { error: 'All prompts must be non-empty strings' };
    }
    
    if (prompt.length > 1000) {
      return { error: 'Each prompt must be 1000 characters or less' };
    }
    
    // Basic content filtering
    const forbiddenPatterns = [
      /nude|naked|sexual/i,
      /violence|blood|gore/i,
      /hate|racism|discrimination/i
    ];
    
    if (forbiddenPatterns.some(pattern => pattern.test(prompt))) {
      return { error: 'Inappropriate content detected in prompts' };
    }
  }
  
  return { prompts: prompts.map(p => p.trim()) };
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
    
    const { prompts, error } = validateInput(body);
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

    const images = [];

    for (const prompt of prompts) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          size: '1024x1024',
          quality: 'hd',
          n: 1
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate image for prompt: ${prompt}`, await response.text());
        continue;
      }

      const data = await response.json();
      if (data.data && data.data[0]) {
        // Convert image URL to base64
        const imageResponse = await fetch(data.data[0].url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        images.push(base64Image);
      }
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});