
import { CensusData, ValidationResult, ValidationError, ValidationWarning } from '@/types/census';

export const validateCensusData = async (data: CensusData): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!data || !data.records || data.records.length === 0) {
    errors.push({
      field: 'Data',
      message: 'No records found in the uploaded file',
      rowIndex: 0
    });
    
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalRecords: 0,
        errorCount: errors.length,
        warningCount: warnings.length,
        demographicCounts: {
          employees: 0,
          spouses: 0,
          children: 0,
          domesticPartners: 0
        }
      }
    };
  }

  const demographicCounts = {
    employees: 0,
    spouses: 0,
    children: 0,
    domesticPartners: 0
  };

  // Basic validation for each record
  data.records.forEach((record, index) => {
    // Count demographics
    const relationship = record.Relationship?.toLowerCase() || '';
    if (relationship === 'employee') {
      demographicCounts.employees++;
    } else if (relationship === 'spouse') {
      demographicCounts.spouses++;
    } else if (relationship === 'child') {
      demographicCounts.children++;
    } else if (relationship === 'domestic partner') {
      demographicCounts.domesticPartners++;
    }

    // Required field validation
    if (!record['Member Last Name']) {
      errors.push({
        field: 'Member Last Name',
        message: 'Last name is required',
        rowIndex: index
      });
    }

    if (!record['First Name']) {
      errors.push({
        field: 'First Name',
        message: 'First name is required',
        rowIndex: index
      });
    }

    if (!record['Date of Birth']) {
      errors.push({
        field: 'Date of Birth',
        message: 'Date of birth is required',
        rowIndex: index
      });
    } else {
      // Validate date format
      const dobString = record['Date of Birth'];
      const dobPattern = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dobPattern.test(dobString)) {
        warnings.push({
          field: 'Date of Birth',
          message: 'Date should be in mm/dd/yyyy format',
          rowIndex: index
        });
      }
    }

    // SSN validation for employees
    if (relationship === 'employee') {
      const ssn = record['Social Security Number'];
      if (!ssn) {
        errors.push({
          field: 'Social Security Number',
          message: 'SSN is required for employees',
          rowIndex: index
        });
      } else if (!/^\d{9}$/.test(ssn.replace(/\D/g, ''))) {
        errors.push({
          field: 'Social Security Number',
          message: 'SSN must be 9 digits',
          rowIndex: index
        });
      }
    }

    // Gender validation
    const gender = record.Gender?.toUpperCase();
    if (gender && !['M', 'F'].includes(gender)) {
      errors.push({
        field: 'Gender',
        message: 'Gender must be M or F',
        rowIndex: index
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalRecords: data.records.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      demographicCounts
    }
  };
};
