
import { CensusData, ValidationResult, ValidationError, ValidationWarning } from '@/types/census';

export const validateCensusData = async (data: CensusData): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!data || !data.masterCensus || data.masterCensus.length === 0) {
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
        validRecords: 0,
        errorCount: errors.length,
        warningCount: warnings.length,
        demographicCounts: {
          employees: 0,
          spouses: 0,
          children: 0,
          domesticPartners: 0
        },
        coverageEnrollment: {
          dental: 0,
          vision: 0,
          life: 0
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

  const coverageEnrollment = {
    dental: 0,
    vision: 0,
    life: 0
  };

  // Basic validation for each record
  data.masterCensus.forEach((record, index) => {
    // Count demographics
    const relationship = record.relationship?.toLowerCase() || '';
    if (relationship === 'employee') {
      demographicCounts.employees++;
    } else if (relationship === 'spouse') {
      demographicCounts.spouses++;
    } else if (relationship === 'child') {
      demographicCounts.children++;
    } else if (relationship === 'domestic partner') {
      demographicCounts.domesticPartners++;
    }

    // Count coverage enrollment
    if (record.dentalPlanElection && record.dentalPlanElection.toLowerCase() !== 'waive') {
      coverageEnrollment.dental++;
    }
    if (record.visionPlanElection && record.visionPlanElection.toLowerCase() !== 'waive') {
      coverageEnrollment.vision++;
    }
    if (record.basicLifeCoverageType && record.basicLifeCoverageType.toLowerCase() !== 'waive') {
      coverageEnrollment.life++;
    }

    // Required field validation
    if (!record.memberLastName) {
      errors.push({
        field: 'Member Last Name',
        message: 'Last name is required',
        rowIndex: index
      });
    }

    if (!record.firstName) {
      errors.push({
        field: 'First Name',
        message: 'First name is required',
        rowIndex: index
      });
    }

    if (!record.dateOfBirth) {
      errors.push({
        field: 'Date of Birth',
        message: 'Date of birth is required',
        rowIndex: index
      });
    } else {
      // Validate date format - handle both Excel serial numbers and date strings
      const dobValue = record.dateOfBirth;
      let isValidDate = false;
      
      if (typeof dobValue === 'number') {
        // Excel serial date number
        if (dobValue > 0 && dobValue < 100000) {
          isValidDate = true;
        }
      } else if (typeof dobValue === 'string') {
        const dobPattern = /^\d{2}\/\d{2}\/\d{4}$/;
        if (dobPattern.test(dobValue)) {
          isValidDate = true;
        } else {
          // Try to parse as date
          const parsedDate = new Date(dobValue);
          if (!isNaN(parsedDate.getTime())) {
            isValidDate = true;
          }
        }
      }
      
      if (!isValidDate) {
        warnings.push({
          field: 'Date of Birth',
          message: 'Date format may need verification',
          rowIndex: index
        });
      }
    }

    // SSN validation for employees
    if (relationship === 'employee') {
      const ssn = record.socialSecurityNumber;
      if (!ssn) {
        errors.push({
          field: 'Social Security Number',
          message: 'SSN is required for employees',
          rowIndex: index
        });
      } else {
        // Handle both string and number SSN formats
        const ssnString = ssn.toString().replace(/\D/g, '');
        if (ssnString.length !== 9) {
          errors.push({
            field: 'Social Security Number',
            message: 'SSN must be 9 digits',
            rowIndex: index
          });
        }
      }
    }

    // Gender validation
    const gender = record.gender?.toString().toUpperCase();
    if (gender && !['M', 'F', 'MALE', 'FEMALE'].includes(gender)) {
      errors.push({
        field: 'Gender',
        message: 'Gender must be M, F, Male, or Female',
        rowIndex: index
      });
    }

    // Salary validation
    if (record.salaryAmount) {
      const salaryString = record.salaryAmount.toString().replace(/[$,]/g, '');
      const salaryNumber = parseFloat(salaryString);
      if (isNaN(salaryNumber) || salaryNumber <= 0) {
        warnings.push({
          field: 'Salary',
          message: 'Salary amount should be a valid positive number',
          rowIndex: index
        });
      }
    }

    // Phone number validation
    if (record.phone) {
      const phoneString = record.phone.toString().replace(/\D/g, '');
      if (phoneString.length !== 10) {
        warnings.push({
          field: 'Phone Number',
          message: 'Phone number should be 10 digits',
          rowIndex: index
        });
      }
    }

    // Email validation
    if (record.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(record.email.toString())) {
        warnings.push({
          field: 'Email Address',
          message: 'Email format appears invalid',
          rowIndex: index
        });
      }
    }

    // Zip code validation
    if (record.zip) {
      const zipString = record.zip.toString().replace(/\D/g, '');
      if (zipString.length !== 5) {
        warnings.push({
          field: 'Zip Code',
          message: 'Zip code should be 5 digits',
          rowIndex: index
        });
      }
    }
  });

  const validRecords = data.masterCensus.length - errors.length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalRecords: data.masterCensus.length,
      validRecords,
      errorCount: errors.length,
      warningCount: warnings.length,
      demographicCounts,
      coverageEnrollment
    }
  };
};
