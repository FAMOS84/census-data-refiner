
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { CensusData, ValidationResult } from '@/types/census';
import { validateCensusData } from '@/utils/dataValidator';

interface ValidationResultsProps {
  data: CensusData | null;
  onValidationComplete: (results: ValidationResult) => void;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ data, onValidationComplete }) => {
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (data && data.masterCensus && data.masterCensus.length > 0) {
      performValidation();
    } else {
      setValidationResults(null);
    }
  }, [data]);

  const performValidation = async () => {
    if (!data || !data.masterCensus || data.masterCensus.length === 0) return;
    
    setIsValidating(true);
    try {
      const results = await validateCensusData(data);
      setValidationResults(results);
      onValidationComplete(results);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResults(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (!data || !data.masterCensus || data.masterCensus.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data to validate</p>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Validating data...</p>
      </div>
    );
  }

  if (!validationResults) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Validation not completed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={validationResults.isValid ? "default" : "destructive"}>
              {validationResults.isValid ? "Valid" : "Has Issues"}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationResults.summary.totalRecords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{validationResults.summary.errorCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{validationResults.summary.warningCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Errors */}
      {validationResults.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Validation Errors ({validationResults.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {validationResults.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{error.field}:</strong> {error.message}
                  {error.rowIndex !== undefined && ` (Row ${error.rowIndex + 1})`}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validationResults.warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Validation Warnings ({validationResults.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {validationResults.warnings.map((warning, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{warning.field}:</strong> {warning.message}
                  {warning.rowIndex !== undefined && ` (Row ${warning.rowIndex + 1})`}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Demographics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="text-2xl font-bold">{validationResults.summary.demographicCounts.employees}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spouses</p>
              <p className="text-2xl font-bold">{validationResults.summary.demographicCounts.spouses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Children</p>
              <p className="text-2xl font-bold">{validationResults.summary.demographicCounts.children}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Domestic Partners</p>
              <p className="text-2xl font-bold">{validationResults.summary.demographicCounts.domesticPartners}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationResults;
