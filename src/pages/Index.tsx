
import React from 'react';
import CensusFormatter from '@/components/CensusFormatter';
import SessionTimer from '@/components/SessionTimer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <SessionTimer />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Census Data Formatter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your LMG census file and automatically format and clean the data layout for optimal processing.
          </p>
        </div>
        
        <CensusFormatter />
      </div>
    </div>
  );
};

export default Index;
