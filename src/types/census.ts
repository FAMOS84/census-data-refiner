
export interface CensusData {
  masterCensus: MasterCensusRecord[];
}

export interface MasterCensusRecord {
  // Employee Information
  relationship: 'Employee' | 'Spouse' | 'Domestic Partner' | 'Child';
  employeeStatus: 'Active' | 'COBRA' | 'Retiree' | '';
  socialSecurityNumber?: string;
  memberLastName: string;
  firstName: string;
  middleInitial?: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  disabled: 'Yes' | 'No';
  
  // Contact Information
  memberStreetAddress: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  dateOfHire?: string;
  
  // Benefits Information (Employee lines only)
  dentalPlanElection?: string;
  dentalCoverageType?: 'EE' | 'ES' | 'EC' | 'EF' | 'W'; // Dental allows all tiers
  dhmoProviderName?: string;
  dentalPriorCarrierName?: string;
  dentalPriorCarrierEffectiveDate?: string;
  dentalPriorCarrierTermDate?: string;
  dentalPriorCarrierOrtho?: 'Yes' | 'No';
  
  visionPlanElection?: string;
  visionCoverageType?: 'EE' | 'ES' | 'EC' | 'EF' | 'W'; // Vision allows all tiers
  
  basicLifeCoverageType?: 'EE' | 'W'; // Basic Life only allows EE or W
  primaryLifeBeneficiary?: string;
  dependentBasicLife?: 'Enroll' | 'W';
  lifeADDClass?: string;
  
  employeeVolumeAmount?: number;
  spouseVolumeAmount?: number;
  dependentVolume?: '5000' | '10000' | '0' | 'Enroll' | 'W';
  
  std?: 'EE' | 'W'; // STD only allows EE or W
  ltd?: 'EE' | 'W'; // LTD only allows EE or W
  stdClass?: string;
  ltdClass?: string;
  
  salaryType?: 'Annual' | 'Hourly';
  salaryAmount?: number;
  occupation?: string;
  hoursWorked?: number;
  workingLocation?: string;
  billingDivision?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  field: string;
  message: string;
  rowIndex?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  rowIndex?: number;
}

export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  errorCount: number;
  warningCount: number;
  demographicCounts: {
    employees: number;
    spouses: number;
    children: number;
    domesticPartners: number;
  };
  coverageEnrollment: {
    dental: number;
    vision: number;
    life: number;
  };
}
