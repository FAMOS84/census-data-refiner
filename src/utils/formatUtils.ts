
export const cleanText = (text: any): string => {
  if (!text) return '';
  return text
    .toString()
    .toUpperCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatName = (name: any): string => {
  if (!name) return '';
  return cleanText(name);
};

export const formatMiddleInitial = (initial: any): string => {
  if (!initial) return '';
  return initial.toString().charAt(0).toUpperCase();
};

export const formatDate = (date: any): string => {
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

export const formatSalary = (salary: any, salaryType: any, hoursWorked: any): number | undefined => {
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

export const formatSSN = (ssn: any): string => {
  if (!ssn) return '';
  const cleanSSN = ssn.toString().replace(/\D/g, '');
  // Pad with leading zeros if less than 9 digits
  return cleanSSN.padStart(9, '0');
};

export const formatAddress = (address: any): string => {
  if (!address) return '';
  return address
    .toString()
    .toUpperCase()
    .replace(/[^\w\s]/g, ' ') // Remove all punctuation and special characters
    .replace(/#/g, ' UNIT ')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bCIRCLE\b/g, 'CIR')
    .replace(/\bPLACE\b/g, 'PL')
    .replace(/\bTERRACE\b/g, 'TER')
    .replace(/\bPARKWAY\b/g, 'PKWY')
    .replace(/\bHIGHWAY\b/g, 'HWY')
    .replace(/\bNORTH\b/g, 'N')
    .replace(/\bSOUTH\b/g, 'S')
    .replace(/\bEAST\b/g, 'E')
    .replace(/\bWEST\b/g, 'W')
    .replace(/\bNORTHEAST\b/g, 'NE')
    .replace(/\bNORTHWEST\b/g, 'NW')
    .replace(/\bSOUTHEAST\b/g, 'SE')
    .replace(/\bSOUTHWEST\b/g, 'SW')
    .replace(/\bAPARTMENT\b/g, 'APT')
    .replace(/\bSUITE\b/g, 'STE')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatCity = (city: any): string => {
  if (!city) return '';
  return city.toString().toUpperCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
};

export const formatState = (state: any): string => {
  if (!state) return '';
  return state.toString().toUpperCase().replace(/[^\w]/g, '').substring(0, 2);
};

export const formatZip = (zip: any): string => {
  if (!zip) return '';
  return zip.toString().replace(/\D/g, '').substring(0, 5);
};

export const formatPhone = (phone: any): string => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '').substring(0, 10);
};

export const formatCoverageType = (coverage: any): 'EE' | 'ES' | 'EC' | 'EF' | 'W' | undefined => {
  if (!coverage) return undefined;
  
  const coverageStr = coverage.toString().toUpperCase().trim();
  
  // Handle waiver variations
  if (coverageStr === 'WAIVE' || coverageStr === 'WAIVED' || coverageStr === 'W') {
    return 'W';
  }
  
  // Handle standard coverage types
  if (coverageStr === 'EE' || coverageStr === 'EMPLOYEE ONLY') return 'EE';
  if (coverageStr === 'ES' || coverageStr === 'EMPLOYEE SPOUSE') return 'ES';
  if (coverageStr === 'EC' || coverageStr === 'EMPLOYEE CHILD' || coverageStr === 'EMPLOYEE CHILDREN') return 'EC';
  if (coverageStr === 'EF' || coverageStr === 'EMPLOYEE FAMILY') return 'EF';
  
  // Return the original value if we can't determine the mapping
  return coverageStr as any;
};

// New function for coverages that only allow EE or W (Basic Life, STD, LTD)
export const formatRestrictedCoverageType = (coverage: any): 'EE' | 'W' | undefined => {
  if (!coverage) return undefined;
  
  const coverageStr = coverage.toString().toUpperCase().trim();
  
  // Handle waiver variations
  if (coverageStr === 'WAIVE' || coverageStr === 'WAIVED' || coverageStr === 'W') {
    return 'W';
  }
  
  // For restricted coverages, anything that's not a waiver becomes EE
  if (coverageStr === 'EE' || coverageStr === 'EMPLOYEE ONLY' || 
      coverageStr === 'ES' || coverageStr === 'EMPLOYEE SPOUSE' ||
      coverageStr === 'EC' || coverageStr === 'EMPLOYEE CHILD' || coverageStr === 'EMPLOYEE CHILDREN' ||
      coverageStr === 'EF' || coverageStr === 'EMPLOYEE FAMILY') {
    return 'EE';
  }
  
  // Return EE for any other non-waiver value
  return 'EE';
};
