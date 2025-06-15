
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
    .replace(/#/g, ' UNIT ')
    .replace(/\bRD\b/g, 'ROAD')
    .replace(/\bST\b/g, 'STREET')
    .replace(/\bBLVD\b/g, 'BOULEVARD')
    .replace(/\bAVE\b/g, 'AVENUE')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatCity = (city: any): string => {
  if (!city) return '';
  return city.toString().toUpperCase().replace(/[^\w\s]/g, '').trim();
};

export const formatState = (state: any): string => {
  if (!state) return '';
  return state.toString().toUpperCase().substring(0, 2);
};

export const formatZip = (zip: any): string => {
  if (!zip) return '';
  return zip.toString().replace(/\D/g, '').substring(0, 5);
};

export const formatPhone = (phone: any): string => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '').substring(0, 10);
};
