
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import WelcomeVideo from '@/components/WelcomeVideo';

const PinAuth = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  // Rate limiting: 5 attempts per 15 minutes, 15 minute lockout
  const rateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minute lockout
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (!rateLimiter.canAttempt) {
      if (rateLimiter.isLocked) {
        setError(`Too many failed attempts. Try again in ${rateLimiter.remainingLockTime} seconds.`);
      } else {
        setError(`Maximum attempts reached. Please wait before trying again.`);
      }
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(pin);
      rateLimiter.recordAttempt(result.success);
      
      if (!result.success) {
        setError(result.error || 'Invalid PIN. Please try again.');
        setPin('');
        
        if (rateLimiter.remainingAttempts <= 1) {
          setError(`Invalid PIN. ${rateLimiter.remainingAttempts} attempt(s) remaining before lockout.`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Authentication failed. Please try again.');
      setPin('');
      rateLimiter.recordAttempt(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <WelcomeVideo />
        <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Census Data Formatter</CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setError('');
                }}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {rateLimiter.isLocked && (
              <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked. Try again in {rateLimiter.remainingLockTime} seconds.
                </AlertDescription>
              </Alert>
            )}

            {!rateLimiter.isLocked && rateLimiter.remainingAttempts < 5 && (
              <Alert variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {rateLimiter.remainingAttempts} attempt(s) remaining before temporary lockout.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={pin.length !== 4 || isLoading || !rateLimiter.canAttempt}
            >
              {isLoading ? 'Verifying...' : 'Access System'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Need access? Contact your system administrator.
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PinAuth;
