
import { CensusData, ValidationResult, ValidationError, ValidationWarning } from '@/types/census';

export const validateCensusData = async (data: CensusData): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate GRP INFO
  validateGrpInfo(data.grpInfo, errors, warnings);

  // Validate MASTER CENSUS
  validateMasterCensus(data.masterCensus, errors, warnings);

  // Calculate summary
  const summary = calculateSummary(data, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary
  };
};

const validateGrpInfo = (grpInfo: any, errors: ValidationError[], warnings: ValidationWarning[]) => {
  if (!grpInfo.groupName) {
    errors.push({ field: 'Group Name', message: 'Group Name is required' });
  }
  
  if (!grpInfo.totalEligible || grpInfo.totalEligible <= 0) {
    errors.push({ field: 'Total Eligible', message: 'Total Eligible must be greater than 0' });
  }
  
  if (!grpInfo.effectiveDate) {
    warnings.push({ field: 'Effective Date', message: 'Effective Date should be provided' });
  }
};

const validateMasterCensus = (masterCensus: any[], errors: ValidationError[], warnings: ValidationWarning[]) => {
  if (!masterCensus || masterCensus.length === 0) {
    errors.push({ field: 'Master Census', message: 'No census records found' });
    return;
  }

  masterCensus.forEach((record, index) => {
    validateRecord(record, index, errors, warnings);
  });
};

const validateRecord = (record: any, index: number, errors: ValidationError[], warnings: ValidationWarning[]) => {
  // Required fields validation
  if (!record.memberLastName) {
    errors.push({ field: 'Member Last Name', message: 'Last Name is required', rowIndex: index });
  }
  
  if (!record.firstName) {
    errors.push({ field: 'First Name', message: 'First Name is required', rowIndex: index });
  }
  
  if (!record.gender || !['M', 'F'].includes(record.gender)) {
    errors.push({ field: 'Gender', message: 'Gender must be M or F', rowIndex: index });
  }
  
  if (!record.dateOfBirth) {
    errors.push({ field: 'Date of Birth', message: 'Date of Birth is required', rowIndex: index });
  } else {
    // Validate date format
    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dobRegex.test(record.dateOfBirth)) {
      errors.push({ field: 'Date of Birth', message: 'Date of Birth must be in MM/DD/YYYY format', rowIndex: index });
    }
  }
  
  // Relationship validation
  if (!record.relationship || !['Employee', 'Spouse', 'Domestic Partner', 'Child'].includes(record.relationship)) {
    errors.push({ field: 'Relationship', message: 'Invalid relationship type', rowIndex: index });
  }
  
  // Child age validation
  if (record.relationship === 'Child' && record.dateOfBirth) {
    const birthDate = new Date(record.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age > 25 && record.disabled !== 'Yes') {
      warnings.push({ 
        field: 'Child Age', 
        message: 'Child over 25 should be marked as disabled', 
        rowIndex: index 
      });
    }
  }
  
  // Employee-specific validations
  if (record.relationship === 'Employee') {
    if (!record.dateOfHire) {
      warnings.push({ field: 'Date of Hire', message: 'Date of Hire should be provided for employees', rowIndex: index });
    }
    
    if (!record.employeeStatus) {
      warnings.push({ field: 'Employee Status', message: 'Employee Status should be specified', rowIndex: index });
    }
  }
  
  // Address validation
  if (!record.memberStreetAddress) {
    warnings.push({ field: 'Street Address', message: 'Street Address should be provided', rowIndex: index });
  }
  
  if (!record.city) {
    warnings.push({ field: 'City', message: 'City should be provided', rowIndex: index });
  }
  
  if (!record.state) {
    warnings.push({ field: 'State', message: 'State should be provided', rowIndex: index });
  } else if (record.state.length !== 2) {
    errors.push({ field: 'State', message: 'State must be 2 characters', rowIndex: index });
  }
  
  if (!record.zip) {
    warnings.push({ field: 'Zip', message: 'Zip code should be provided', rowIndex: index });
  } else if (!/^\d{5}$/.test(record.zip)) {
    errors.push({ field: 'Zip', message: 'Zip code must be 5 digits', rowIndex: index });
  }
  
  // SSN validation for employees
  if (record.relationship === 'Employee' && record.socialSecurityNumber) {
    if (!/^\d{9}$/.test(record.socialSecurityNumber)) {
      errors.push({ field: 'SSN', message: 'SSN must be 9 digits', rowIndex: index });
    }
  }
  
  // Phone validation
  if (record.phone && !/^\d{10}$/.test(record.phone)) {
    errors.push({ field: 'Phone', message: 'Phone must be 10 digits', rowIndex: index });
  }
};

const calculateSummary = (data: CensusData, errors: ValidationError[], warnings: ValidationWarning[]) => {
  const demographicCounts = {
    employees: 0,
    spouses: 0,
    children: 0,
    domesticPartners: 0
  };
  
  const coverageEnrollment = {
    dental: { EE: 0, ES: 0, EC: 0, EF: 0, W: 0 },
    vision: { EE: 0, ES: 0, EC: 0, EF: 0, W: 0 },
    basicLife: { enrolled: 0, waived: 0 },
    voluntaryLife: { enrolled: 0, waived: 0 }
  };
  
  data.masterCensus.forEach(record => {
    // Count demographics
    switch (record.relationship) {
      case 'Employee':
        demographicCounts.employees++;
        break;
      case 'Spouse':
        demographicCounts.spouses++;
        break;
      case 'Child':
        demographicCounts.children++;
        break;
      case 'Domestic Partner':
        demographicCounts.domesticPartners++;
        break;
    }
    
    // Count coverage enrollment (only for employees)
    if (record.relationship === 'Employee') {
      if (record.dentalCoverageType && record.dentalCoverageType !== 'W') {
        coverageEnrollment.dental[record.dentalCoverageType as keyof typeof coverageEnrollment.dental]++;
      } else {
        coverageEnrollment.dental.W++;
      }
      
      if (record.visionCoverageType && record.visionCoverageType !== 'W') {
        coverageEnrollment.vision[record.visionCoverageType as keyof typeof coverageEnrollment.vision]++;
      } else {
        coverageEnrollment.vision.W++;
      }
      
      if (record.basicLifeCoverageType === 'EE') {
        coverageEnrollment.basicLife.enrolled++;
      } else {
        coverageEnrollment.basicLife.waived++;
      }
      
      if (record.employeeVolumeAmount && record.employeeVolumeAmount > 0) {
        coverageEnrollment.voluntaryLife.enrolled++;
      } else {
        coverageEnrollment.voluntaryLife.waived++;
      }
    }
  });
  
  return {
    totalRecords: data.masterCensus.length,
    validRecords: data.masterCensus.length - errors.filter(e => e.rowIndex !== undefined).length,
    errorCount: errors.length,
    warningCount: warnings.length,
    demographicCounts,
    coverageEnrollment
  };
};
