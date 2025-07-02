
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { ValidationResult } from '@/types/census';
import { analyzeColumns } from '@/utils/columnAnalyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

      // Create HELLO tab with user guidance
      const helloData = [
        ['Thank you for using the Census Formatting Tool!'],
        [''],
        ['Here are some helpful tips for using this tool:'],
        [''],
        ['Tip 1: Simplify Your Data Upload'],
        ['If you only have 1 dental plan and 1 vision plan,'],
        ['you can delete the Plan Selection columns and just upload the Coverage Type columns.'],
        ['The system will auto-assign those for you!'],
        [''],
        ['Tip 2: Understanding Coverage Values'],
        ['When uploading the final census into NCAM for quotes,'],
        ['the system prefers "W" for waivers.'],
        ['However, in LMG (Launch My Group),'],
        ['those "W" values need to be updated to "Waive with other coverage".'],
        [''],
        ['Tip 3: Blank Columns'],
        ['Any completely blank columns have been moved to the BLANKS tab'],
        ['to keep your main census clean and organized.'],
        [''],
        ['Tip 4: Upload Strategy for Best Results'],
        ['Leaving your blank columns off your upload will make it easier to identify mapping issues.'],
        ['When uploading this census as a "Use your own" file,'],
        ['make sure to verify all the mappings and correct any that may say "REMOVE" automatically.'],
        ['If a blank column is left on the upload, those default to "REMOVE."'],
        [''],
        ['Once all is uploaded and verified, circle back to the Enrollment section'],
        ['to download the Launch My Group census.'],
        ['It will be updated live with your uploaded census from here.'],
        ['Then validate, save, and upload that final census for a more automated implementation.'],
        [''],
        ['Tip 5: DHMO Dental Verification'],
        ['If your group includes DHMO dental, you will need to verify each uploaded employee record'],
        ['as there is an auto assign checkbox to select if a provider has not been selected.'],
        [''],
        ['Tip 6: Quality Check Best Practice'],
        ['Spot check your enrollments, especially your voluntary life elections.'],
        ['Compare them to your original census pre-census cleaning to ensure all is accurate.'],
        [''],
        ['We hope this tool saves you time and effort!']
      ];

      const helloSheet = XLSX.utils.aoa_to_sheet(helloData);
      XLSX.utils.book_append_sheet(workbook, helloSheet, 'HELLO');

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
