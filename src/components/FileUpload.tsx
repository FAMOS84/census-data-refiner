
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { CensusData } from '@/types/census';

interface FileUploadProps {
  onDataUploaded: (data: CensusData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUploaded }) => {
  const processFile = useCallback(async (file: File) => {
    try {
      console.log('=== NEW FILE UPLOAD STARTED ===');
      console.log('Processing file:', file.name, 'Size:', file.size, 'bytes');
      
      // Clear any existing data first
      console.log('Clearing previous data...');
      
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Extract MASTER CENSUS sheet (first sheet or specifically named)
      const masterCensusSheet = workbook.Sheets['MASTER CENSUS'] || workbook.Sheets[workbook.SheetNames[0]];
      if (!masterCensusSheet) {
        throw new Error('No sheets found in the workbook');
      }
      
      const masterCensusData = XLSX.utils.sheet_to_json(masterCensusSheet, { header: 1 });
      console.log('Raw sheet data rows:', masterCensusData.length);
      
      if (masterCensusData.length < 2) {
        throw new Error('No data rows found in the sheet');
      }
      
      // Get headers from first row
      const headers = masterCensusData[0] as string[];
      const dataRows = masterCensusData.slice(1);
      
      console.log('Headers found:', headers.length);
      console.log('Data rows to process:', dataRows.length);
      
      // Convert rows to objects
      const masterCensusRecords = dataRows.map((row: any, index: number) => {
        const record: any = {};
        headers.forEach((header, headerIndex) => {
          const cleanHeader = header?.toString().trim();
          if (cleanHeader) {
            record[cleanHeader] = row[headerIndex];
          }
        });
        return record;
      }).filter((record, index) => {
        // Filter out empty rows
        const hasData = Object.values(record).some(value => value && value.toString().trim());
        if (!hasData) {
          console.log(`Filtering out empty row at index ${index}`);
        }
        return hasData;
      });
      
      console.log('Final processed records:', masterCensusRecords.length);
      console.log('Sample of first record:', JSON.stringify(masterCensusRecords[0], null, 2));
      
      // Create completely new data object
      const processedData: CensusData = {
        masterCensus: masterCensusRecords
      };
      
      console.log('=== CALLING onDataUploaded WITH NEW DATA ===');
      console.log('New data contains records:', processedData.masterCensus.length);
      
      onDataUploaded(processedData);
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${masterCensusRecords.length} records from ${file.name}`,
      });
      
      console.log('=== FILE UPLOAD COMPLETED ===');
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Please ensure the file is a valid Excel format (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  }, [onDataUploaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            {isDragActive ? (
              <Upload className="h-8 w-8 text-primary" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the file here' : 'Upload Census File'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop an Excel file (.xlsx or .xls) or click to browse
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => document.querySelector('input')?.click()}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Choose File
        </Button>
      </div>
      
      <div className="text-center space-y-3 mt-6">
        <p className="text-sm text-muted-foreground">
          Copyright (C) KFA 2025
        </p>
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border">
          <p className="font-medium mb-1">Privacy & Security Notice</p>
          <p>
            Your census file will only be processed within your local computer. Nothing is exchanged, 
            submitted or stored anywhere other than on your local machine. This session will clean and 
            dump all data once the browser is closed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
