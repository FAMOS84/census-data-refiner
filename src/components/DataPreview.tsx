
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CensusData } from '@/types/census';
import { formatCensusData } from '@/utils/dataFormatter';
import { analyzeColumns, ColumnAnalysis } from '@/utils/columnAnalyzer';
import ColumnMapper from './ColumnMapper';

interface DataPreviewProps {
  data: CensusData | null;
  onFormattedData: (formattedData: any) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, onFormattedData }) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [columnAnalysis, setColumnAnalysis] = useState<ColumnAnalysis | null>(null);

  useEffect(() => {
    if (data && data.masterCensus.length > 0) {
      // Extract headers from the first record
      const headers = Object.keys(data.masterCensus[0]);
      setRawHeaders(headers);
      
      // Analyze columns for blank detection
      const analysis = analyzeColumns(data.masterCensus);
      setColumnAnalysis(analysis);
      
      // Show preview of first 5 records
      const preview = {
        masterCensus: data.masterCensus.slice(0, 5)
      };
      setPreviewData(preview);
      
      // Show column mapper by default
      setShowColumnMapper(true);
    }
  }, [data]);

  const handleColumnMappingComplete = async (mapping: Record<string, string>) => {
    if (!data) return;
    
    setColumnMapping(mapping);
    setIsFormatting(true);
    setShowColumnMapper(false);
    
    try {
      // Apply column mapping to the data
      const mappedData = {
        masterCensus: data.masterCensus.map(record => {
          const mappedRecord: any = {};
          
          // Apply the column mapping
          Object.entries(mapping).forEach(([fieldKey, headerName]) => {
            if (headerName && record[headerName] !== undefined) {
              mappedRecord[fieldKey] = record[headerName];
            }
          });
          
          return mappedRecord;
        })
      };
      
      console.log('Applying column mapping:', mapping);
      console.log('Mapped data sample:', mappedData.masterCensus[0]);
      
      const formatted = await formatCensusData(mappedData);
      onFormattedData(formatted);
      setPreviewData({ masterCensus: formatted.masterCensus.slice(0, 5) });
    } catch (error) {
      console.error('Error formatting data:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleShowColumnMapper = () => {
    setShowColumnMapper(true);
  };

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data uploaded yet</p>
      </div>
    );
  }

  if (showColumnMapper) {
    return (
      <ColumnMapper
        rawHeaders={rawHeaders}
        sampleData={data.masterCensus.slice(0, 3)}
        onMappingComplete={handleColumnMappingComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {isFormatting ? 'Formatting...' : (Object.keys(columnMapping).length > 0 ? 'Formatted' : 'Raw Data')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleShowColumnMapper} 
              variant="outline"
              size="sm"
            >
              Remap Columns
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview (First 5 Records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="w-full">
            <TabsList>
              <TabsTrigger value="data">Data ({rawHeaders.length - (columnAnalysis?.blankColumns.length || 0)} columns)</TabsTrigger>
              {columnAnalysis && columnAnalysis.blankColumns.length > 0 && (
                <TabsTrigger value="blanks">Blanks ({columnAnalysis.blankColumns.length} columns)</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="data">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {rawHeaders.filter(header => !columnAnalysis?.blankColumns.includes(header)).map((header, index) => (
                        <TableHead key={header} className="min-w-[120px]">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData?.masterCensus.map((record: any, index: number) => (
                      <TableRow key={index}>
                        {rawHeaders.filter(header => !columnAnalysis?.blankColumns.includes(header)).map((header) => (
                          <TableCell key={header} className="max-w-[200px] truncate">
                            {data?.masterCensus[index]?.[header]?.toString() || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {columnAnalysis && columnAnalysis.blankColumns.length > 0 && (
              <TabsContent value="blanks">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    These columns were completely blank in your uploaded data:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnAnalysis.blankColumns.map((header) => (
                      <div key={header} className="p-3 border rounded-lg bg-muted/50">
                        <div className="font-medium text-sm">{header}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          No data found
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;
