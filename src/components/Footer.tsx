
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 KFA. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/security" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Security & Best Practices
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
