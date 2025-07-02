
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { ValidationResult } from '@/types/census';
import { analyzeColumns } from '@/utils/columnAnalyzer';

interface ExportOptionsProps {
  formattedData: any;
  validationResults: ValidationResult | null;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ formattedData, validationResults }) => {
  const exportToExcel = () => {
    console.log('Export data:', formattedData);
    
    if (!formattedData || !formattedData.masterCensus || formattedData.masterCensus.length === 0) {
      toast({
        title: "No data to export",
        description: "Please format your data first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Analyze columns to separate populated from blank
      const columnAnalysis = analyzeColumns(formattedData.masterCensus);

      // All available headers in order
      const allHeaders = [
        'Relationship',
        'Employee Status',
        'Social Security Number',
        'Member Last Name',
        'First Name',
        'Middle Initial',
        'Gender',
        'Date of Birth',
        'Disabled',
        'Member Street Address',
        'City',
        'State',
        'Zip',
        'Phone',
        'Email',
        'Date of Hire',
        'Dental Plan Election',
        'Dental Coverage Type',
        'DHMO Provider Name',
        'Dental Prior Carrier Name',
        'Dental Prior Carrier Effective Date',
        'Dental Prior Carrier Term Date',
        'Dental Prior Carrier Ortho',
        'Vision Plan Election',
        'Vision Coverage Type',
        'Basic Life Coverage Type',
        'Primary Life Beneficiary',
        'Dependent Basic Life',
        'Life ADD Class',
        'Employee Volume Amount',
        'Spouse Volume Amount',
        'Dependent Volume',
        'STD',
        'LTD',
        'STD Class',
        'LTD Class',
        'Salary Type',
        'Salary Amount',
        'Occupation',
        'Hours Worked',
        'Working Location',
        'Billing Division'
      ];

      // Create mapping of display names to record properties
      const headerToProperty: { [key: string]: string } = {
        'Relationship': 'relationship',
        'Employee Status': 'employeeStatus',
        'Social Security Number': 'socialSecurityNumber',
        'Member Last Name': 'memberLastName',
        'First Name': 'firstName',
        'Middle Initial': 'middleInitial',
        'Gender': 'gender',
        'Date of Birth': 'dateOfBirth',
        'Disabled': 'disabled',
        'Member Street Address': 'memberStreetAddress',
        'City': 'city',
        'State': 'state',
        'Zip': 'zip',
        'Phone': 'phone',
        'Email': 'email',
        'Date of Hire': 'dateOfHire',
        'Dental Plan Election': 'dentalPlanElection',
        'Dental Coverage Type': 'dentalCoverageType',
        'DHMO Provider Name': 'dhmoProviderName',
        'Dental Prior Carrier Name': 'dentalPriorCarrierName',
        'Dental Prior Carrier Effective Date': 'dentalPriorCarrierEffectiveDate',
        'Dental Prior Carrier Term Date': 'dentalPriorCarrierTermDate',
        'Dental Prior Carrier Ortho': 'dentalPriorCarrierOrtho',
        'Vision Plan Election': 'visionPlanElection',
        'Vision Coverage Type': 'visionCoverageType',
        'Basic Life Coverage Type': 'basicLifeCoverageType',
        'Primary Life Beneficiary': 'primaryLifeBeneficiary',
        'Dependent Basic Life': 'dependentBasicLife',
        'Life ADD Class': 'lifeADDClass',
        'Employee Volume Amount': 'employeeVolumeAmount',
        'Spouse Volume Amount': 'spouseVolumeAmount',
        'Dependent Volume': 'dependentVolume',
        'STD': 'std',
        'LTD': 'ltd',
        'STD Class': 'stdClass',
        'LTD Class': 'ltdClass',
        'Salary Type': 'salaryType',
        'Salary Amount': 'salaryAmount',
        'Occupation': 'occupation',
        'Hours Worked': 'hoursWorked',
        'Working Location': 'workingLocation',
        'Billing Division': 'billingDivision'
      };

      // Filter headers for populated columns only
      const populatedHeaders = allHeaders.filter(header => {
        const property = headerToProperty[header];
        return !columnAnalysis.blankColumns.includes(property);
      });

      // Create MASTER CENSUS sheet with populated columns only
      const masterCensusData = [
        populatedHeaders,
        ...formattedData.masterCensus.map((record: any) => 
          populatedHeaders.map(header => {
            const property = headerToProperty[header];
            return record[property] || '';
          })
        )
      ];

      console.log('Creating MASTER CENSUS sheet with', populatedHeaders.length, 'populated columns');
      const masterCensusSheet = XLSX.utils.aoa_to_sheet(masterCensusData);
      XLSX.utils.book_append_sheet(workbook, masterCensusSheet, 'MASTER CENSUS');

      // Create BLANKS sheet if there are blank columns
      if (columnAnalysis.blankColumns.length > 0) {
        const blankHeaders = allHeaders.filter(header => {
          const property = headerToProperty[header];
          return columnAnalysis.blankColumns.includes(property);
        });

        const blanksData = [
          blankHeaders,
          ...formattedData.masterCensus.map((record: any) => 
            blankHeaders.map(header => {
              const property = headerToProperty[header];
              return record[property] || '';
            })
          )
        ];

        console.log('Creating BLANKS sheet with', blankHeaders.length, 'blank columns');
        const blanksSheet = XLSX.utils.aoa_to_sheet(blanksData);
        XLSX.utils.book_append_sheet(workbook, blanksSheet, 'BLANKS');
      }

      // Export the file
      const fileName = `formatted_census_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Export successful",
        description: `File exported as ${fileName}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the file",
        variant: "destructive",
      });
    }
  };

  if (!formattedData || !formattedData.masterCensus || formattedData.masterCensus.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No formatted data available for export</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{formattedData.masterCensus?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validation Status</p>
              <p className="text-lg font-semibold">
                {validationResults?.isValid ? "✅ Valid" : "⚠️ Has Issues"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Format</p>
              <p className="text-lg font-semibold">Excel (.xlsx)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Download Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={exportToExcel} className="flex-1" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Formatted Census (.xlsx)
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>The exported file will contain:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>MASTER CENSUS sheet with formatted employee data</li>
              <li>All data formatted according to requirements document</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportOptions;
