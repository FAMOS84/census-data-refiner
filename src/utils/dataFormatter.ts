import { CensusData, MasterCensusRecord } from '@/types/census';

export const formatCensusData = async (data: CensusData): Promise<CensusData> => {
  const formattedMasterCensus = data.masterCensus.map(record => formatMasterCensusRecord(record));
  
  // Group records by employee to consolidate voluntary life amounts
  const consolidatedRecords = consolidateVoluntaryLifeAmounts(formattedMasterCensus);
  
  return {
    masterCensus: consolidatedRecords
  };
};

const consolidateVoluntaryLifeAmounts = (records: MasterCensusRecord[]): MasterCensusRecord[] => {
  // Process records in their original order to maintain sequence
  const processedRecords: MasterCensusRecord[] = [];
  const processedIndices = new Set<number>();
  
  for (let i = 0; i < records.length; i++) {
    if (processedIndices.has(i)) continue;
    
    const record = records[i];
    
    if (record.relationship === 'Employee') {
      // Find all dependents that belong to this employee
      const dependents: { record: MasterCensusRecord; index: number }[] = [];
      
      // Look for dependents with matching last name immediately following the employee
      for (let j = i + 1; j < records.length; j++) {
        const potentialDependent = records[j];
        
        // Stop looking when we hit another employee
        if (potentialDependent.relationship === 'Employee') {
          break;
        }
        
        // Check if this dependent belongs to the current employee
        if (potentialDependent.memberLastName === record.memberLastName) {
          dependents.push({ record: potentialDependent, index: j });
        }
      }
      
      // Consolidate voluntary life amounts from dependents to employee
      let consolidatedSpouseVolume = record.spouseVolumeAmount || 0;
      let consolidatedDependentVolume = record.dependentVolume || '0';
      
      dependents.forEach(({ record: dependent }) => {
        if (dependent.relationship === 'Spouse' || dependent.relationship === 'Domestic Partner') {
          if (dependent.spouseVolumeAmount) {
            consolidatedSpouseVolume = Math.max(consolidatedSpouseVolume, dependent.spouseVolumeAmount);
          }
        } else if (dependent.relationship === 'Child') {
          if (dependent.dependentVolume && dependent.dependentVolume !== '0' && dependent.dependentVolume !== 'W') {
            consolidatedDependentVolume = dependent.dependentVolume;
          }
        }
      });
      
      // Update employee record with consolidated amounts
      const updatedEmployee = {
        ...record,
        spouseVolumeAmount: consolidatedSpouseVolume,
        dependentVolume: consolidatedDependentVolume
      };
      
      processedRecords.push(updatedEmployee);
      processedIndices.add(i);
      
      // Add dependents with only basic info (Name, DOB, Disabled, Address) in their original order
      dependents.forEach(({ record: dependent, index }) => {
        const cleanedDependent = {
          ...dependent,
          // Clear out benefit elections for dependents - keep only personal info
          dentalPlanElection: undefined,
          dentalCoverageType: undefined,
          dhmoProviderName: undefined,
          dentalPriorCarrierName: undefined,
          dentalPriorCarrierEffectiveDate: undefined,
          dentalPriorCarrierTermDate: undefined,
          dentalPriorCarrierOrtho: undefined,
          visionPlanElection: undefined,
          visionCoverageType: undefined,
          basicLifeCoverageType: undefined,
          primaryLifeBeneficiary: undefined,
          dependentBasicLife: undefined,
          lifeADDClass: undefined,
          employeeVolumeAmount: undefined,
          spouseVolumeAmount: undefined,
          dependentVolume: undefined,
          std: undefined,
          ltd: undefined,
          stdClass: undefined,
          ltdClass: undefined,
          salaryType: undefined,
          salaryAmount: undefined,
          occupation: undefined,
          hoursWorked: undefined,
          workingLocation: undefined,
          billingDivision: undefined,
          dateOfHire: undefined
        };
        processedRecords.push(cleanedDependent);
        processedIndices.add(index);
      });
    }
  }
  
  // Add any remaining unprocessed records (standalone records)
  for (let i = 0; i < records.length; i++) {
    if (!processedIndices.has(i)) {
      processedRecords.push(records[i]);
    }
  }
  
  return processedRecords;
};

const formatMasterCensusRecord = (record: any): MasterCensusRecord => {
  return {
    // Employee Information
    relationship: validateRelationship(record.relationship),
    employeeStatus: record.employeeStatus || 'Active',
    socialSecurityNumber: formatSSN(record.socialSecurityNumber),
    memberLastName: formatName(record.memberLastName || record.lastName),
    firstName: formatName(record.firstName),
    middleInitial: formatMiddleInitial(record.middleInitial),
    gender: validateGender(record.gender),
    dateOfBirth: formatDate(record.dateOfBirth),
    disabled: record.disabled === 'Yes' ? 'Yes' : 'No',
    
    // Contact Information
    memberStreetAddress: formatAddress(record.memberStreetAddress || record.address),
    city: formatCity(record.city),
    state: formatState(record.state),
    zip: formatZip(record.zip),
    phone: formatPhone(record.phone),
    email: record.email || '',
    dateOfHire: record.relationship === 'Employee' ? formatDate(record.dateOfHire) : undefined,
    
    // Benefits Information (Employee lines only)
    dentalPlanElection: record.relationship === 'Employee' ? record.dentalPlanElection : undefined,
    dentalCoverageType: record.relationship === 'Employee' ? record.dentalCoverageType : undefined,
    dhmoProviderName: record.relationship === 'Employee' ? record.dhmoProviderName : undefined,
    dentalPriorCarrierName: record.relationship === 'Employee' ? record.dentalPriorCarrierName : undefined,
    dentalPriorCarrierEffectiveDate: record.relationship === 'Employee' ? formatDate(record.dentalPriorCarrierEffectiveDate) : undefined,
    dentalPriorCarrierTermDate: record.relationship === 'Employee' ? formatDate(record.dentalPriorCarrierTermDate) : undefined,
    dentalPriorCarrierOrtho: record.relationship === 'Employee' ? (record.dentalPriorCarrierOrtho === 'Yes' ? 'Yes' : 'No') : undefined,
    
    visionPlanElection: record.relationship === 'Employee' ? record.visionPlanElection : undefined,
    visionCoverageType: record.relationship === 'Employee' ? record.visionCoverageType : undefined,
    
    basicLifeCoverageType: record.relationship === 'Employee' ? record.basicLifeCoverageType : undefined,
    primaryLifeBeneficiary: record.relationship === 'Employee' ? record.primaryLifeBeneficiary : undefined,
    dependentBasicLife: record.relationship === 'Employee' ? record.dependentBasicLife : undefined,
    lifeADDClass: record.relationship === 'Employee' ? record.lifeADDClass : undefined,
    
    employeeVolumeAmount: record.relationship === 'Employee' ? parseFloat(record.employeeVolumeAmount) || 0 : undefined,
    spouseVolumeAmount: record.relationship === 'Employee' ? parseFloat(record.spouseVolumeAmount) || 0 : undefined,
    dependentVolume: record.relationship === 'Employee' ? record.dependentVolume : undefined,
    
    std: record.relationship === 'Employee' ? record.std : undefined,
    ltd: record.relationship === 'Employee' ? record.ltd : undefined,
    stdClass: record.relationship === 'Employee' ? record.stdClass : undefined,
    ltdClass: record.relationship === 'Employee' ? record.ltdClass : undefined,
    
    salaryType: record.relationship === 'Employee' ? record.salaryType : undefined,
    salaryAmount: record.relationship === 'Employee' ? formatSalary(record.salaryAmount, record.salaryType, record.hoursWorked) : undefined,
    occupation: record.relationship === 'Employee' ? cleanText(record.occupation) : undefined,
    hoursWorked: record.relationship === 'Employee' ? parseInt(record.hoursWorked) || 40 : undefined,
    workingLocation: record.relationship === 'Employee' ? cleanText(record.workingLocation) : undefined,
    billingDivision: record.relationship === 'Employee' ? cleanText(record.billingDivision) : undefined,
  };
};

// Utility functions for formatting
const cleanText = (text: any): string => {
  if (!text) return '';
  return text
    .toString()
    .toUpperCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatName = (name: any): string => {
  if (!name) return '';
  return cleanText(name);
};

const formatMiddleInitial = (initial: any): string => {
  if (!initial) return '';
  return initial.toString().charAt(0).toUpperCase();
};

const formatDate = (date: any): string => {
  if (!date) return '';
  
  // Handle Excel serial date numbers
  if (typeof date === 'number') {
    // Excel epoch starts from January 1, 1900, but Excel incorrectly treats 1900 as a leap year
    // Excel serial date 1 = January 1, 1900 (but we need to account for the leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const d = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const formatSalary = (salary: any, salaryType: any, hoursWorked: any): number | undefined => {
  if (!salary) return undefined;
  
  // Remove any currency symbols and commas, then parse
  const cleanSalary = salary.toString().replace(/[$,]/g, '');
  const salaryNumber = parseFloat(cleanSalary);
  
  if (isNaN(salaryNumber)) return undefined;
  
  // If it's hourly, annualize it
  if (salaryType && salaryType.toString().toLowerCase() === 'hourly') {
    const hours = parseInt(hoursWorked) || 40; // Default to 40 hours if not specified
    return salaryNumber * hours * 52; // hourly rate * hours per week * 52 weeks
  }
  
  return salaryNumber;
};

const formatSSN = (ssn: any): string => {
  if (!ssn) return '';
  const cleanSSN = ssn.toString().replace(/\D/g, '');
  // Pad with leading zeros if less than 9 digits
  return cleanSSN.padStart(9, '0');
};

const formatAddress = (address: any): string => {
  if (!address) return '';
  return address
    .toString()
    .toUpperCase()
    .replace(/#/g, ' UNIT ')
    .replace(/\bRD\b/g, 'ROAD')
    .replace(/\bST\b/g, 'STREET')
    .replace(/\bBLVD\b/g, 'BOULEVARD')
    .replace(/\bAVE\b/g, 'AVENUE')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatCity = (city: any): string => {
  if (!city) return '';
  return city.toString().toUpperCase().replace(/[^\w\s]/g, '').trim();
};

const formatState = (state: any): string => {
  if (!state) return '';
  return state.toString().toUpperCase().substring(0, 2);
};

const formatZip = (zip: any): string => {
  if (!zip) return '';
  return zip.toString().replace(/\D/g, '').substring(0, 5);
};

const formatPhone = (phone: any): string => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '').substring(0, 10);
};

const validateRelationship = (relationship: any): 'Employee' | 'Spouse' | 'Domestic Partner' | 'Child' => {
  if (!relationship) return 'Employee';
  const rel = relationship.toString().toLowerCase();
  if (rel.includes('spouse')) return 'Spouse';
  if (rel.includes('domestic') || rel.includes('partner')) return 'Domestic Partner';
  if (rel.includes('child') || rel.includes('dependent')) return 'Child';
  return 'Employee';
};

const validateGender = (gender: any): 'M' | 'F' => {
  if (!gender) return 'M';
  const g = gender.toString().toLowerCase();
  return g.startsWith('f') ? 'F' : 'M';
};
