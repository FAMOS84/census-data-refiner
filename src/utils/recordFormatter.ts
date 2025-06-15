
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
  cleanText 
} from './formatUtils';
import { validateRelationship, validateGender } from './fieldValidators';

export const formatMasterCensusRecord = (record: any): MasterCensusRecord => {
  const relationship = validateRelationship(record.relationship);
  
  return {
    // Employee Information
    relationship: relationship,
    employeeStatus: relationship === 'Employee' ? (record.employeeStatus || 'Active') : '',
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
    email: record.email || '', // Email keeps special characters as requested
    dateOfHire: record.relationship === 'Employee' ? formatDate(record.dateOfHire) : undefined,
    
    // Benefits Information (Employee lines only) - with appropriate coverage formatting
    dentalPlanElection: record.relationship === 'Employee' ? record.dentalPlanElection : undefined,
    dentalCoverageType: record.relationship === 'Employee' ? formatCoverageType(record.dentalCoverageType) : undefined, // Dental allows all tiers
    dhmoProviderName: record.relationship === 'Employee' ? cleanText(record.dhmoProviderName) : undefined,
    dentalPriorCarrierName: record.relationship === 'Employee' ? cleanText(record.dentalPriorCarrierName) : undefined,
    dentalPriorCarrierEffectiveDate: record.relationship === 'Employee' ? formatDate(record.dentalPriorCarrierEffectiveDate) : undefined,
    dentalPriorCarrierTermDate: record.relationship === 'Employee' ? formatDate(record.dentalPriorCarrierTermDate) : undefined,
    dentalPriorCarrierOrtho: record.relationship === 'Employee' ? (record.dentalPriorCarrierOrtho === 'Yes' ? 'Yes' : 'No') : undefined,
    
    visionPlanElection: record.relationship === 'Employee' ? cleanText(record.visionPlanElection) : undefined,
    visionCoverageType: record.relationship === 'Employee' ? formatCoverageType(record.visionCoverageType) : undefined, // Vision allows all tiers
    
    basicLifeCoverageType: record.relationship === 'Employee' ? formatRestrictedCoverageType(record.basicLifeCoverageType) : undefined, // Basic Life only EE or W
    primaryLifeBeneficiary: record.relationship === 'Employee' ? cleanText(record.primaryLifeBeneficiary) : undefined,
    dependentBasicLife: record.relationship === 'Employee' ? (record.dependentBasicLife === 'Enroll' ? 'Enroll' : 'W') : undefined,
    lifeADDClass: record.relationship === 'Employee' ? cleanText(record.lifeADDClass) : undefined,
    
    employeeVolumeAmount: record.relationship === 'Employee' ? parseFloat(record.employeeVolumeAmount) || 0 : undefined,
    spouseVolumeAmount: record.relationship === 'Employee' ? parseFloat(record.spouseVolumeAmount) || 0 : undefined,
    dependentVolume: record.relationship === 'Employee' ? formatDependentVolume(record.dependentVolume) : undefined,
    
    std: record.relationship === 'Employee' ? formatRestrictedCoverageType(record.std) : undefined, // STD only EE or W
    ltd: record.relationship === 'Employee' ? formatRestrictedCoverageType(record.ltd) : undefined, // LTD only EE or W
    stdClass: record.relationship === 'Employee' ? cleanText(record.stdClass) : undefined,
    ltdClass: record.relationship === 'Employee' ? cleanText(record.ltdClass) : undefined,
    
    salaryType: record.relationship === 'Employee' ? record.salaryType : undefined,
    salaryAmount: record.relationship === 'Employee' ? formatSalary(record.salaryAmount, record.salaryType, record.hoursWorked) : undefined,
    occupation: record.relationship === 'Employee' ? cleanText(record.occupation) : undefined,
    hoursWorked: record.relationship === 'Employee' ? parseInt(record.hoursWorked) || 40 : undefined,
    workingLocation: record.relationship === 'Employee' ? cleanText(record.workingLocation) : undefined,
    billingDivision: record.relationship === 'Employee' ? cleanText(record.billingDivision) : undefined,
  };
};

const formatDependentVolume = (volume: any): '5000' | '10000' | '0' | 'Enroll' | 'W' => {
  if (!volume) return 'W';
  
  const volumeStr = volume.toString().toUpperCase().trim();
  
  // Log for debugging
  console.log('Formatting dependent volume:', volume, 'cleaned:', volumeStr);
  
  // Handle waiver variations
  if (volumeStr === 'WAIVE' || volumeStr === 'WAIVED' || volumeStr === 'W') {
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
