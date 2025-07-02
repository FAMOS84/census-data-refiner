
import { MasterCensusRecord } from '@/types/census';
import { 
  formatName, 
  formatMiddleInitial, 
  formatDate, 
  formatSalary, 
  formatSSN, 
  formatAddress, 
  formatCity, 
  formatState, 
  formatZip, 
  formatPhone,
  formatCoverageType,
  formatRestrictedCoverageType,
  formatRelationshipText,
  formatGenderText,
  formatOccupation,
  cleanText 
} from './formatUtils';
import { validateRelationship, validateGender } from './fieldValidators';
import { hasExistingEntries } from './columnAnalyzer';

export const formatMasterCensusRecord = (record: any, allRecords: any[]): MasterCensusRecord => {
  // Format relationship and gender text, then validate them
  const formattedRelationshipText = formatRelationshipText(record.relationship);
  const relationship = validateRelationship(formattedRelationshipText);
  
  const formattedGenderText = formatGenderText(record.gender);
  const gender = validateGender(formattedGenderText);
  
  return {
    // Employee Information
    relationship: relationship,
    employeeStatus: relationship === 'Employee' ? (record.employeeStatus || 'Active') : '',
    socialSecurityNumber: formatSSN(record.socialSecurityNumber),
    memberLastName: formatName(record.memberLastName || record.lastName),
    firstName: formatName(record.firstName),
    middleInitial: formatMiddleInitial(record.middleInitial),
    gender: gender,
    dateOfBirth: formatDate(record.dateOfBirth),
    disabled: record.disabled === 'Yes' ? 'Yes' : 'No',
    
    // Contact Information
    memberStreetAddress: formatAddress(record.memberStreetAddress || record.address),
    city: formatCity(record.city),
    state: formatState(record.state),
    zip: formatZip(record.zip),
    phone: formatPhone(record.phone),
    email: record.email || '', // Email keeps special characters as requested
    dateOfHire: relationship === 'Employee' ? formatDate(record.dateOfHire) : undefined,
    
    // Benefits Information (Employee lines only) - with appropriate coverage formatting
    dentalPlanElection: relationship === 'Employee' ? record.dentalPlanElection : undefined,
    dentalCoverageType: relationship === 'Employee' ? formatCoverageType(record.dentalCoverageType) : undefined, // Dental allows all tiers
    dhmoProviderName: relationship === 'Employee' ? cleanText(record.dhmoProviderName) : undefined,
    dentalPriorCarrierName: relationship === 'Employee' ? cleanText(record.dentalPriorCarrierName) : undefined,
    dentalPriorCarrierEffectiveDate: relationship === 'Employee' ? formatDate(record.dentalPriorCarrierEffectiveDate) : undefined,
    dentalPriorCarrierTermDate: relationship === 'Employee' ? formatDate(record.dentalPriorCarrierTermDate) : undefined,
    dentalPriorCarrierOrtho: relationship === 'Employee' ? (record.dentalPriorCarrierOrtho === 'Yes' ? 'Yes' : 'No') : undefined,
    
    visionPlanElection: relationship === 'Employee' ? cleanText(record.visionPlanElection) : undefined,
    visionCoverageType: relationship === 'Employee' ? formatCoverageType(record.visionCoverageType) : undefined, // Vision allows all tiers
    
    basicLifeCoverageType: relationship === 'Employee' ? formatRestrictedCoverageType(record.basicLifeCoverageType) : undefined, // Basic Life only EE or W
    primaryLifeBeneficiary: relationship === 'Employee' ? cleanText(record.primaryLifeBeneficiary) : undefined,
    dependentBasicLife: relationship === 'Employee' ? formatDependentBasicLife(record.dependentBasicLife, allRecords) : undefined,
    lifeADDClass: relationship === 'Employee' ? cleanText(record.lifeADDClass) : undefined,
    
    employeeVolumeAmount: relationship === 'Employee' ? parseFloat(record.employeeVolumeAmount) || 0 : undefined,
    spouseVolumeAmount: relationship === 'Employee' ? parseFloat(record.spouseVolumeAmount) || 0 : undefined,
    dependentVolume: relationship === 'Employee' ? formatDependentVolume(record.dependentVolume) : undefined,
    
    std: relationship === 'Employee' ? formatRestrictedCoverageType(record.std) : undefined, // STD only EE or W
    ltd: relationship === 'Employee' ? formatRestrictedCoverageType(record.ltd) : undefined, // LTD only EE or W
    stdClass: relationship === 'Employee' ? cleanText(record.stdClass) : undefined,
    ltdClass: relationship === 'Employee' ? cleanText(record.ltdClass) : undefined,
    
    salaryType: relationship === 'Employee' ? record.salaryType : undefined,
    salaryAmount: relationship === 'Employee' ? formatSalary(record.salaryAmount, record.salaryType, record.hoursWorked) : undefined,
    occupation: relationship === 'Employee' ? formatOccupation(record.occupation) : undefined,
    hoursWorked: relationship === 'Employee' ? parseInt(record.hoursWorked) || 40 : undefined,
    workingLocation: relationship === 'Employee' ? cleanText(record.workingLocation) : undefined,
    billingDivision: relationship === 'Employee' ? cleanText(record.billingDivision) : undefined,
  };
};

const formatDependentBasicLife = (value: any, allRecords: any[]): 'Enroll' | 'W' | undefined => {
  if (!value) {
    // Check if there are existing entries in this column across all records
    const hasExisting = hasExistingEntries(allRecords, 'dependentBasicLife');
    if (hasExisting) {
      return 'W'; // Auto-fill with Waiver only if column has some entries
    }
    return undefined; // Leave blank if column is completely empty
  }
  
  const valueStr = value.toString().toUpperCase().trim();
  
  // Handle enrollment
  if (valueStr === 'ENROLL' || valueStr === 'ENROLLED') {
    return 'Enroll';
  }
  
  // Handle waiver variations
  if (valueStr === 'WAIVE' || valueStr === 'WAIVED' || valueStr === 'W') {
    return 'W';
  }
  
  // If there's any other value, leave it undefined (blank)
  return undefined;
};

const formatDependentVolume = (volume: any): '5000' | '10000' | '0' | 'Enroll' | 'W' => {
  if (!volume) return 'W';
  
  const volumeStr = volume.toString().toUpperCase().trim();
  
  // Log for debugging
  console.log('Formatting dependent volume:', volume, 'cleaned:', volumeStr);
  
  // Handle waiver variations - including "Waive with Other Coverage"
  if (volumeStr === 'WAIVE' || volumeStr === 'WAIVED' || volumeStr === 'W' || 
      volumeStr === 'WAIVE WITH OTHER COVERAGE' || volumeStr.includes('WAIVE WITH OTHER')) {
    return 'W';
  }
  
  // Handle enrollment - this should prompt user for clarification
  if (volumeStr === 'ENROLL' || volumeStr === 'ENROLLED') {
    console.warn('VALIDATION NEEDED: Dependent Child Voluntary Life shows "Enroll" but no specific amount (5000 or 10000) specified. Please verify the intended coverage amount.');
    return 'Enroll';
  }
  
  // Handle specific amounts - be more flexible with number parsing
  const numericValue = volumeStr.replace(/[$,\s]/g, '');
  
  if (numericValue === '5000' || volumeStr.includes('5000')) {
    return '5000';
  }
  
  if (numericValue === '10000' || volumeStr.includes('10000')) {
    return '10000';
  }
  
  // Handle zero or decline
  if (volumeStr === '0' || volumeStr === '$0' || volumeStr === 'DECLINE' || volumeStr === 'DECLINED') {
    return '0';
  }
  
  // If we can't determine, log the issue and default to waiver
  console.warn('Unknown dependent volume value:', volume, 'defaulting to W');
  return 'W';
};

// New function to roll up dependent voluntary life amounts to employee lines
export const rollUpDependentVoluntaryLife = (records: MasterCensusRecord[]): MasterCensusRecord[] => {
  console.log('Starting dependent voluntary life rollup...');
  
  const processedRecords = [...records];
  
  for (let i = 0; i < processedRecords.length; i++) {
    const record = processedRecords[i];
    
    // Only process employee records
    if (record.relationship !== 'Employee') continue;
    
    // Look for dependents immediately following this employee
    for (let j = i + 1; j < processedRecords.length; j++) {
      const dependentRecord = processedRecords[j];
      
      // Stop when we hit another employee
      if (dependentRecord.relationship === 'Employee') break;
      
      // Process spouse voluntary life
      if (dependentRecord.relationship === 'Spouse' || dependentRecord.relationship === 'Domestic Partner') {
        const spouseVolume = getDependentVolumeAmount(dependentRecord);
        console.log(`Found spouse volume for ${dependentRecord.firstName} ${dependentRecord.memberLastName}:`, spouseVolume);
        if (spouseVolume > 0) {
          record.spouseVolumeAmount = (record.spouseVolumeAmount || 0) + spouseVolume;
          console.log(`Rolled up ${spouseVolume} from ${dependentRecord.relationship} to Employee spouse volume. New total: ${record.spouseVolumeAmount}`);
        }
      }
      
      // Process child voluntary life
      if (dependentRecord.relationship === 'Child') {
        const childVolume = getDependentVolumeAmount(dependentRecord);
        console.log(`Found child volume for ${dependentRecord.firstName} ${dependentRecord.memberLastName}:`, childVolume);
        if (childVolume > 0) {
          // For children, we set the dependentVolume field
          if (childVolume === 5000) {
            record.dependentVolume = '5000';
          } else if (childVolume === 10000) {
            record.dependentVolume = '10000';
          }
          console.log(`Rolled up ${childVolume} from Child to Employee dependent volume`);
        }
      }
    }
  }
  
  console.log('Dependent voluntary life rollup completed');
  return processedRecords;
};

// Helper function to extract volume amount from dependent records
const getDependentVolumeAmount = (record: any): number => {
  console.log('Checking volume fields for record:', record.firstName, record.memberLastName);
  console.log('Raw record data:', record);
  
  // Check specific fields that are likely to contain voluntary life amounts
  const volumeFields = [
    record.employeeVolumeAmount,
    record.spouseVolumeAmount, 
    record.dependentVolume,
    record.voluntaryLife,
    record.volume,
    record.volLife,
    record.voluntaryLifeAmount,
    record.lifeAmount,
    record.amount,
    record.coverage,
    record.benefit,
    record.benefitAmount
  ];
  
  // Only check fields that explicitly contain "life" or "volume" in their name
  Object.keys(record).forEach(key => {
    const keyLower = key.toLowerCase();
    if ((keyLower.includes('life') || keyLower.includes('volume') || keyLower.includes('vol')) && 
        !keyLower.includes('zip') && !keyLower.includes('postal') && !keyLower.includes('phone')) {
      const value = record[key];
      if (value && typeof value !== 'object') {
        const stringValue = value.toString().trim();
        // If the field contains a number that looks like a life insurance amount
        if (/^\$?[\d,]+\.?\d*$/.test(stringValue)) {
          const numericValue = parseFloat(stringValue.replace(/[$,]/g, ''));
          // Life insurance amounts are typically in thousands, not 5-digit ZIP codes
          if (numericValue >= 1000 && numericValue <= 1000000 && numericValue % 1000 === 0) {
            console.log(`Found potential volume in field "${key}":`, numericValue);
            volumeFields.push(value);
          }
        }
      }
    }
  });
  
  for (const field of volumeFields) {
    if (field) {
      const stringValue = field.toString().replace(/[$,\s]/g, '');
      const numericValue = parseFloat(stringValue);
      console.log(`Checking field value: ${field} -> parsed: ${numericValue}`);
      // Ensure we're getting reasonable life insurance amounts and not ZIP codes
      if (!isNaN(numericValue) && numericValue >= 1000 && numericValue <= 1000000 && numericValue % 1000 === 0) {
        console.log(`Found valid volume amount: ${numericValue}`);
        return numericValue;
      }
    }
  }
  
  console.log('No volume amount found for this record');
  return 0;
};
