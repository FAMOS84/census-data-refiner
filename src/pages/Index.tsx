
import React from 'react';
import CensusFormatter from '@/components/CensusFormatter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Census Data Formatter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your existing census files and automatically format them according to the requirements document specifications
          </p>
        </div>
        
        <CensusFormatter />
      </div>
    </div>
  );
};

export default Index;
