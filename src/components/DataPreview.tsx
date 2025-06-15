import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CensusData } from '@/types/census';
import { formatCensusData } from '@/utils/dataFormatter';

interface DataPreviewProps {
  data: CensusData | null;
  onFormattedData: (formattedData: any) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, onFormattedData }) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    if (data) {
      // Show preview of first 10 records
      const preview = {
        masterCensus: data.masterCensus.slice(0, 10)
      };
      setPreviewData(preview);
    }
  }, [data]);

  const handleFormatData = async () => {
    if (!data) return;
    
    setIsFormatting(true);
    try {
      const formatted = await formatCensusData(data);
      onFormattedData(formatted);
      setPreviewData(formatted);
    } catch (error) {
      console.error('Error formatting data:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.masterCensus.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {previewData ? 'Formatted' : 'Raw Data'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Format Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleFormatData} 
          disabled={isFormatting}
          size="lg"
        >
          {isFormatting ? 'Formatting...' : 'Format Data According to Requirements'}
        </Button>
      </div>

      {/* Data Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview (First 10 Records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Employee Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData?.masterCensus.map((record: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{record.relationship}</TableCell>
                    <TableCell>{record.memberLastName}</TableCell>
                    <TableCell>{record.firstName}</TableCell>
                    <TableCell>{record.gender}</TableCell>
                    <TableCell>{record.dateOfBirth}</TableCell>
                    <TableCell>{record.employeeStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;
