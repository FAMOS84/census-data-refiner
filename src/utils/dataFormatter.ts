
import { CensusData, MasterCensusRecord } from '@/types/census';

export const formatCensusData = async (data: CensusData): Promise<CensusData> => {
  const formattedMasterCensus = data.masterCensus.map(record => formatMasterCensusRecord(record));
  
  return {
    masterCensus: formattedMasterCensus
  };
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
    salaryAmount: record.relationship === 'Employee' ? parseFloat(record.salaryAmount) || undefined : undefined,
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
    const excelEpoch = new Date(1900, 0, 1);
    const d = new Date(excelEpoch.getTime() + (date - 1) * 24 * 60 * 60 * 1000);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const formatSSN = (ssn: any): string => {
  if (!ssn) return '';
  return ssn.toString().replace(/\D/g, '');
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
