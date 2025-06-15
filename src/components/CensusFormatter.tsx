import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from './FileUpload';
import DataPreview from './DataPreview';
import ValidationResults from './ValidationResults';
import ExportOptions from './ExportOptions';
import { CensusData } from '@/types/census';

const CensusFormatter = () => {
  const [uploadedData, setUploadedData] = useState<CensusData | null>(null);
  const [formattedData, setFormattedData] = useState<CensusData | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);

  const handleDataUploaded = (data: CensusData) => {
    console.log('=== HANDLING NEW DATA UPLOAD ===');
    console.log('Previous uploadedData records:', uploadedData?.masterCensus?.length || 0);
    console.log('Previous formattedData records:', formattedData?.masterCensus?.length || 0);
    console.log('New data records:', data.masterCensus.length);
    
    // Explicitly clear all previous state
    setFormattedData(null);
    setValidationResults(null);
    
    // Set the new uploaded data
    setUploadedData(data);
    
    console.log('State cleared and new data set');
    console.log('=== DATA UPLOAD HANDLING COMPLETE ===');
  };

  const handleFormattedData = (data: CensusData) => {
    console.log('=== HANDLING FORMATTED DATA ===');
    console.log('Formatted data records:', data.masterCensus.length);
    setFormattedData(data);
    // Reset validation when new formatted data is available
    setValidationResults(null);
    console.log('=== FORMATTED DATA HANDLING COMPLETE ===');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview" disabled={!uploadedData}>Preview</TabsTrigger>
          <TabsTrigger value="validate" disabled={!formattedData}>Validate</TabsTrigger>
          <TabsTrigger value="export" disabled={!formattedData || !validationResults}>Export</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Census File</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onDataUploaded={handleDataUploaded} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DataPreview 
                data={uploadedData} 
                onFormattedData={handleFormattedData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationResults 
                data={formattedData} 
                onValidationComplete={setValidationResults}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Formatted Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportOptions 
                formattedData={formattedData}
                validationResults={validationResults}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CensusFormatter;
