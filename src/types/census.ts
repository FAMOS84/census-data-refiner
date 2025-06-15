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
  dentalCoverageType?: 'EE' | 'ES' | 'EC' | 'EF' | 'W';
  dhmoProviderName?: string;
  dentalPriorCarrierName?: string;
  dentalPriorCarrierEffectiveDate?: string;
  dentalPriorCarrierTermDate?: string;
  dentalPriorCarrierOrtho?: 'Yes' | 'No';
  
  visionPlanElection?: string;
  visionCoverageType?: 'EE' | 'ES' | 'EC' | 'EF' | 'W';
  
  basicLifeCoverageType?: 'EE' | 'W';
  primaryLifeBeneficiary?: string;
  dependentBasicLife?: 'Enroll' | 'W';
  lifeADDClass?: string;
  
  employeeVolumeAmount?: number;
  spouseVolumeAmount?: number;
  dependentVolume?: '5000' | '10000' | '0' | 'Enroll' | 'W';
  
  std?: 'EE' | 'W';
  ltd?: 'EE' | 'W';
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
