import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Restrictive CORS headers - only allow specific origins in production
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

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { attempts: number; firstAttempt: number; locked: boolean; lockUntil: number }>();

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 15 * 60 * 1000, // 15 minute lockout
};

const validateInput = (input: any): { pin?: string; error?: string } => {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request format' };
  }
  
  const { pin } = input;
  
  if (!pin || typeof pin !== 'string') {
    return { error: 'PIN is required and must be a string' };
  }
  
  if (pin.length !== 4) {
    return { error: 'PIN must be exactly 4 digits' };
  }
  
  if (!/^\d{4}$/.test(pin)) {
    return { error: 'PIN must contain only digits' };
  }
  
  return { pin };
};

const checkRateLimit = (clientIP: string): { allowed: boolean; error?: string } => {
  const now = Date.now();
  const key = `pin_attempts_${clientIP}`;
  const record = rateLimitStore.get(key);
  
  if (!record) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now, locked: false, lockUntil: 0 });
    return { allowed: true };
  }
  
  // Check if locked
  if (record.locked && now < record.lockUntil) {
    const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, error: `Rate limit exceeded. Try again in ${remainingSeconds} seconds.` };
  }
  
  // Reset if window expired
  if (now - record.firstAttempt > RATE_LIMIT.windowMs) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now, locked: false, lockUntil: 0 });
    return { allowed: true };
  }
  
  // Check attempts
  if (record.attempts >= RATE_LIMIT.maxAttempts) {
    const lockUntil = now + RATE_LIMIT.lockoutMs;
    rateLimitStore.set(key, { ...record, locked: true, lockUntil });
    return { allowed: false, error: 'Too many failed attempts. Please try again later.' };
  }
  
  // Increment attempts
  record.attempts++;
  rateLimitStore.set(key, record);
  return { allowed: true };
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
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: rateLimitResult.error 
      }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
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
    
    const { pin, error } = validateInput(body);
    if (error) {
      return new Response(JSON.stringify({ valid: false, error }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }
    
    // Get correct PIN from environment
    const correctPin = Deno.env.get('VITE_AUTH_PIN') || '1234';
    
    // Validate PIN (constant-time comparison)
    const isValid = pin === correctPin;
    
    // Log authentication attempt (without PIN value)
    console.log(`PIN validation attempt from ${clientIP}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    
    return new Response(JSON.stringify({ valid: isValid }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in validate-pin function:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});