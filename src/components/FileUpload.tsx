
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { CensusData } from '@/types/census';

interface FileUploadProps {
  onDataUploaded: (data: CensusData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUploaded }) => {
  const processFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Extract GRP INFO sheet
      const grpInfoSheet = workbook.Sheets['GRP INFO'] || workbook.Sheets[workbook.SheetNames[0]];
      const grpInfoData = XLSX.utils.sheet_to_json(grpInfoSheet, { header: 1 });
      
      // Extract MASTER CENSUS sheet
      const masterCensusSheet = workbook.Sheets['MASTER CENSUS'] || workbook.Sheets[workbook.SheetNames[1]];
      const masterCensusData = XLSX.utils.sheet_to_json(masterCensusSheet, { header: 1 });
      
      // Process the data into our format
      const processedData: CensusData = {
        grpInfo: {
          groupName: '',
          quoteId: '',
          agentHan: '',
          agentName: '',
          totalEligible: 0,
          effectiveDate: '',
          humanaSalesRep: '',
          incumbentCarrierName: '',
          descriptionOfDentalPlans: ''
        },
        masterCensus: []
      };
      
      onDataUploaded(processedData);
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${masterCensusData.length} records from ${file.name}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: "Please ensure the file is a valid Excel format (.xlsx or .xls)",
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
    </div>
  );
};

export default FileUpload;
