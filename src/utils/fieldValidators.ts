
export const validateRelationship = (relationship: any): 'Employee' | 'Spouse' | 'Domestic Partner' | 'Child' => {
  if (!relationship) return 'Employee';
  const rel = relationship.toString().toLowerCase();
  if (rel.includes('spouse')) return 'Spouse';
  if (rel.includes('domestic') || rel.includes('partner')) return 'Domestic Partner';
  if (rel.includes('child') || rel.includes('dependent')) return 'Child';
  return 'Employee';
};

export const validateGender = (gender: any): 'M' | 'F' => {
  if (!gender) return 'M';
  const g = gender.toString().toLowerCase();
  return g.startsWith('f') ? 'F' : 'M';
};
