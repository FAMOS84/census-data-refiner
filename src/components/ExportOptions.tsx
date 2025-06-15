import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { ValidationResult } from '@/types/census';

interface ExportOptionsProps {
  formattedData: any;
  validationResults: ValidationResult | null;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ formattedData, validationResults }) => {
  const exportToExcel = () => {
    if (!formattedData) {
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

      // Create MASTER CENSUS sheet
      if (formattedData.masterCensus && formattedData.masterCensus.length > 0) {
        const headers = [
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

        const masterCensusData = [
          headers,
          ...formattedData.masterCensus.map((record: any) => [
            record.relationship,
            record.employeeStatus,
            record.socialSecurityNumber,
            record.memberLastName,
            record.firstName,
            record.middleInitial,
            record.gender,
            record.dateOfBirth,
            record.disabled,
            record.memberStreetAddress,
            record.city,
            record.state,
            record.zip,
            record.phone,
            record.email,
            record.dateOfHire,
            record.dentalPlanElection,
            record.dentalCoverageType,
            record.dhmoProviderName,
            record.dentalPriorCarrierName,
            record.dentalPriorCarrierEffectiveDate,
            record.dentalPriorCarrierTermDate,
            record.dentalPriorCarrierOrtho,
            record.visionPlanElection,
            record.visionCoverageType,
            record.basicLifeCoverageType,
            record.primaryLifeBeneficiary,
            record.dependentBasicLife,
            record.lifeADDClass,
            record.employeeVolumeAmount,
            record.spouseVolumeAmount,
            record.dependentVolume,
            record.std,
            record.ltd,
            record.stdClass,
            record.ltdClass,
            record.salaryType,
            record.salaryAmount,
            record.occupation,
            record.hoursWorked,
            record.workingLocation,
            record.billingDivision
          ])
        ];

        const masterCensusSheet = XLSX.utils.aoa_to_sheet(masterCensusData);
        XLSX.utils.book_append_sheet(workbook, masterCensusSheet, 'MASTER CENSUS');
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

  if (!formattedData) {
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
