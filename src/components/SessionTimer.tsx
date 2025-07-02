import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const SessionTimer = () => {
  const { sessionTimeRemaining, logout } = useAuth();

  // Show warning when less than 5 minutes remaining
  if (sessionTimeRemaining <= 0) {
    return null;
  }

  if (sessionTimeRemaining <= 300) { // 5 minutes
    const minutes = Math.floor(sessionTimeRemaining / 60);
    const seconds = sessionTimeRemaining % 60;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Session expires in {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="ml-4"
          >
            Logout Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SessionTimer;