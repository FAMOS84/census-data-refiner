
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
  cleanText 
} from './formatUtils';
import { validateRelationship, validateGender } from './fieldValidators';

export const formatMasterCensusRecord = (record: any): MasterCensusRecord => {
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
