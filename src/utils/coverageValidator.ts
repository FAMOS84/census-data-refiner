
export const getUnknownCoverageTypes = (data: any[]): string[] => {
  const unknownTypes = new Set<string>();
  const knownTypes = ['EE', 'ES', 'EC', 'EF', 'W', 'WAIVE', 'WAIVED', 'EMPLOYEE ONLY', 'EMPLOYEE SPOUSE', 'EMPLOYEE CHILD', 'EMPLOYEE CHILDREN', 'EMPLOYEE FAMILY'];
  
  data.forEach(record => {
    // Check all coverage type fields
    const coverageFields = [
      record.dentalCoverageType,
      record.visionCoverageType,
      record.basicLifeCoverageType,
      record.std,
      record.ltd
    ];
    
    coverageFields.forEach(coverage => {
      if (coverage && typeof coverage === 'string') {
        const coverageStr = coverage.toString().toUpperCase().trim();
        if (coverageStr && !knownTypes.includes(coverageStr)) {
          unknownTypes.add(coverageStr);
        }
      }
    });
  });
  
  return Array.from(unknownTypes);
};
