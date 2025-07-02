
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ColumnMapperProps {
  rawHeaders: string[];
  sampleData: any[];
  onMappingComplete: (mapping: Record<string, string>) => void;
}

const REQUIRED_FIELDS = [
  { key: 'relationship', label: 'Relationship', required: true },
  { key: 'memberLastName', label: 'Member Last Name', required: true },
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'middleInitial', label: 'Middle Initial', required: false },
  { key: 'gender', label: 'Gender', required: true },
  { key: 'dateOfBirth', label: 'Date of Birth', required: true },
  { key: 'socialSecurityNumber', label: 'Social Security Number', required: false },
  { key: 'employeeStatus', label: 'Employee Status', required: false },
  { key: 'disabled', label: 'Disabled', required: false },
  { key: 'memberStreetAddress', label: 'Member Street Address', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'state', label: 'State', required: false },
  { key: 'zip', label: 'Zip Code', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'email', label: 'Email Address', required: false },
  { key: 'dateOfHire', label: 'Date of Hire', required: false },
  { key: 'salaryAmount', label: 'Salary', required: false },
  { key: 'salaryType', label: 'Annual or Hourly', required: false },
  { key: 'hoursWorked', label: 'Hours Worked Per Week', required: false },
  { key: 'occupation', label: 'Occupation', required: false },
  { key: 'workingLocation', label: 'Working Location', required: false },
  { key: 'billingDivision', label: 'Billing Division', required: false },
  { key: 'dentalPlanElection', label: 'Dental Plan Election', required: false },
  { key: 'dentalCoverageType', label: 'Dental Coverage Type', required: false },
  { key: 'dhmoProviderName', label: 'DHMO Provider Name', required: false },
  { key: 'dentalPriorCarrierName', label: 'Prior Carrier Name', required: false },
  { key: 'dentalPriorCarrierEffectiveDate', label: 'Prior Carrier Eff Date', required: false },
  { key: 'dentalPriorCarrierTermDate', label: 'Prior Carrier Term Date', required: false },
  { key: 'dentalPriorCarrierOrtho', label: 'Prior Carrier Ortho?', required: false },
  { key: 'visionPlanElection', label: 'Vision Plan Selection', required: false },
  { key: 'visionCoverageType', label: 'Vision Coverage Type', required: false },
  { key: 'basicLifeCoverageType', label: 'Basic Life Election', required: false },
  { key: 'dependentBasicLife', label: 'Dependent Basic Life', required: false },
  { key: 'primaryLifeBeneficiary', label: 'Primary Life Beneficiary', required: false },
  { key: 'employeeVolumeAmount', label: 'Employee Voluntary Life', required: false },
  { key: 'spouseVolumeAmount', label: 'Spousal Voluntary Life', required: false },
  { key: 'dependentVolume', label: 'Child Voluntary Life', required: false },
  { key: 'std', label: 'STD Coverage Type', required: false },
  { key: 'ltd', label: 'LTD Coverage Type', required: false },
  { key: 'lifeADDClass', label: 'Basic Life Class', required: false },
];

const NO_MAPPING_VALUE = '__NO_MAPPING__';

const ColumnMapper: React.FC<ColumnMapperProps> = ({ rawHeaders, sampleData, onMappingComplete }) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [autoMapped, setAutoMapped] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-map columns based on header names
    const autoMapping: Record<string, string> = {};
    
    REQUIRED_FIELDS.forEach(field => {
      const matchingHeader = rawHeaders.find(header => {
        const headerLower = header.toLowerCase().trim();
        const fieldLower = field.label.toLowerCase();
        
        // Exact matches
        if (headerLower === fieldLower) return true;
        
        // Partial matches for common variations
        if (field.key === 'memberLastName' && (headerLower.includes('last name') || headerLower.includes('member last'))) return true;
        if (field.key === 'firstName' && headerLower.includes('first name')) return true;
        if (field.key === 'socialSecurityNumber' && (headerLower.includes('ssn') || headerLower.includes('social security'))) return true;
        if (field.key === 'dateOfBirth' && (headerLower.includes('date of birth') || headerLower.includes('dob'))) return true;
        if (field.key === 'memberStreetAddress' && (headerLower.includes('address') || headerLower.includes('street'))) return true;
        if (field.key === 'zip' && (headerLower.includes('zip') || headerLower.includes('postal'))) return true;
        if (field.key === 'phone' && (headerLower.includes('phone') || headerLower.includes('telephone'))) return true;
        if (field.key === 'email' && headerLower.includes('email')) return true;
        if (field.key === 'dateOfHire' && headerLower.includes('hire')) return true;
        if (field.key === 'salaryAmount' && headerLower.includes('salary')) return true;
        if (field.key === 'salaryType' && (headerLower.includes('annual') || headerLower.includes('hourly'))) return true;
        if (field.key === 'hoursWorked' && headerLower.includes('hours')) return true;
        if (field.key === 'employeeStatus' && headerLower.includes('employee status')) return true;
        if (field.key === 'disabled' && headerLower.includes('disabled')) return true;
        
        return false;
      });
      
      if (matchingHeader) {
        autoMapping[field.key] = matchingHeader;
      }
    });
    
    setAutoMapped(autoMapping);
    setMapping(autoMapping);
  }, [rawHeaders]);

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: headerName === NO_MAPPING_VALUE ? '' : headerName
    }));
  };

  const handleApplyMapping = () => {
    onMappingComplete(mapping);
  };

  const getUsedHeaders = () => {
    return Object.values(mapping).filter(Boolean);
  };

  const getUnmappedHeaders = () => {
    const usedHeaders = getUsedHeaders();
    return rawHeaders.filter(header => !usedHeaders.includes(header));
  };

  const getAvailableHeaders = (currentField?: string) => {
    const usedHeaders = getUsedHeaders();
    const currentValue = currentField ? mapping[currentField] : '';
    return rawHeaders.filter(header => 
      !usedHeaders.includes(header) || header === currentValue
    );
  };

  const getMappedCount = () => {
    return Object.values(mapping).filter(Boolean).length;
  };

  const getRequiredMappedCount = () => {
    return REQUIRED_FIELDS.filter(field => field.required && mapping[field.key]).length;
  };

  const getRequiredFieldsCount = () => {
    return REQUIRED_FIELDS.filter(field => field.required).length;
  };

  const getSampleValue = (headerName: string) => {
    if (!headerName || !sampleData.length) return '';
    return sampleData[0][headerName] || '';
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Info className="h-5 w-5" />
            Column Mapping Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">📋 Please follow these steps to map your data columns:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Review the fields below that are highlighted as <span className="bg-red-100 text-red-800 px-2 py-1 rounded dark:bg-red-900 dark:text-red-200">"No Mapping"</span></li>
              <li>For each unmapped field, click the dropdown menu and select the matching column header from your file</li>
              <li>Use the sample data to help identify the correct matches</li>
              <li>Required fields (marked with red highlights) must be mapped to proceed</li>
              <li>Optional fields can be left unmapped if not available in your data</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Common Mappings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Common Column Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="font-medium text-green-800 dark:text-green-200">Names & Personal Info</div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                • First Name → "First Name", "FirstName"<br/>
                • Last Name → "Last Name", "Member Last Name"<br/>
                • SSN → "Social Security Number", "SSN"
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="font-medium text-blue-800 dark:text-blue-200">Contact Information</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                • Address → "Member Street Address", "Address"<br/>
                • Email → "Email Address", "Email"<br/>
                • Phone → "Phone Number", "Phone"
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="font-medium text-purple-800 dark:text-purple-200">Employment & Benefits</div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                • Status → "Employee Status", "Status"<br/>
                • Salary → "Salary Amount", "Annual Salary"<br/>
                • Hours → "Hours Worked Per Week"
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 These mappings are automatically saved and will improve over time to provide better suggestions for future uploads.
          </p>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Column Mapping Progress
            {getRequiredMappedCount() === getRequiredFieldsCount() ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {getRequiredFieldsCount() - getRequiredMappedCount()} required fields missing
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Columns</p>
              <p className="text-lg font-semibold">{rawHeaders.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mapped</p>
              <p className="text-lg font-semibold">{getMappedCount()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unmapped</p>
              <p className="text-lg font-semibold">{getUnmappedHeaders().length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Auto-mapped</p>
              <p className="text-lg font-semibold">{Object.keys(autoMapped).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unmapped Columns */}
      {getUnmappedHeaders().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Unmapped Columns ({getUnmappedHeaders().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getUnmappedHeaders().map((header, index) => (
                <div key={header} className="p-3 border rounded-lg bg-muted/50">
                  <div className="font-medium text-sm">{String.fromCharCode(65 + rawHeaders.indexOf(header))}. {header}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Sample: {getSampleValue(header)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              These columns from your file haven't been mapped to any fields yet. You can map them to optional fields below if needed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Required Field Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {REQUIRED_FIELDS.filter(field => field.required).map(field => {
            const isUnmapped = !mapping[field.key];
            return (
              <div 
                key={field.key} 
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border rounded-lg transition-colors ${
                  isUnmapped 
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
                    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                }`}
              >
                <div>
                  <Label className={`font-medium ${isUnmapped ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                    {field.label}
                    {isUnmapped && <span className="ml-1 text-red-600">*</span>}
                  </Label>
                  {mapping[field.key] && autoMapped[field.key] && (
                    <Badge variant="outline" className="ml-2 text-xs">Auto-mapped</Badge>
                  )}
                  {isUnmapped && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">No Mapping - Please select a column</div>
                  )}
                </div>
                <div>
                  <Select 
                    value={mapping[field.key] || NO_MAPPING_VALUE} 
                    onValueChange={(value) => handleMappingChange(field.key, value)}
                  >
                    <SelectTrigger className={`${isUnmapped ? 'border-red-300 dark:border-red-700' : 'border-green-300 dark:border-green-700'}`}>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value={NO_MAPPING_VALUE} className="text-red-600">-- No mapping --</SelectItem>
                      {getAvailableHeaders(field.key).map((header) => (
                        <SelectItem key={header} value={header}>
                          {`${String.fromCharCode(65 + rawHeaders.indexOf(header))}. ${header}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {mapping[field.key] && (
                    <span>Sample: <span className="font-mono">{getSampleValue(mapping[field.key])}</span></span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Field Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {REQUIRED_FIELDS.filter(field => !field.required).map(field => {
            const isUnmapped = !mapping[field.key];
            return (
              <div 
                key={field.key} 
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border rounded-lg transition-colors ${
                  isUnmapped 
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900' 
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                }`}
              >
                <div>
                  <Label className={`font-medium ${isUnmapped ? 'text-gray-700 dark:text-gray-300' : 'text-blue-800 dark:text-blue-200'}`}>
                    {field.label}
                  </Label>
                  {mapping[field.key] && autoMapped[field.key] && (
                    <Badge variant="outline" className="ml-2 text-xs">Auto-mapped</Badge>
                  )}
                  {isUnmapped && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional - No mapping required</div>
                  )}
                </div>
                <div>
                  <Select 
                    value={mapping[field.key] || NO_MAPPING_VALUE} 
                    onValueChange={(value) => handleMappingChange(field.key, value)}
                  >
                    <SelectTrigger className={`${isUnmapped ? 'border-gray-300 dark:border-gray-600' : 'border-blue-300 dark:border-blue-700'}`}>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value={NO_MAPPING_VALUE}>-- No mapping --</SelectItem>
                      {getAvailableHeaders(field.key).map((header) => (
                        <SelectItem key={header} value={header}>
                          {`${String.fromCharCode(65 + rawHeaders.indexOf(header))}. ${header}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {mapping[field.key] && (
                    <span>Sample: <span className="font-mono">{getSampleValue(mapping[field.key])}</span></span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Apply Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleApplyMapping}
          disabled={getRequiredMappedCount() < getRequiredFieldsCount()}
          size="lg"
        >
          Apply Column Mapping & Format Data
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;
