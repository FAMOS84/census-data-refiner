
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
  const [validationResults, setValidationResults] = useState<any>(null);
  const [formattedData, setFormattedData] = useState<any>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview" disabled={!uploadedData}>Preview</TabsTrigger>
          <TabsTrigger value="validate" disabled={!uploadedData}>Validate</TabsTrigger>
          <TabsTrigger value="export" disabled={!formattedData}>Export</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Census File</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onDataUploaded={setUploadedData} />
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
                onFormattedData={setFormattedData}
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
                data={uploadedData} 
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
