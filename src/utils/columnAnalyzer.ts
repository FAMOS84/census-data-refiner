export interface ColumnAnalysis {
  totalColumns: number;
  blankColumns: string[];
  populatedColumns: string[];
  partiallyFilledColumns: string[];
}

export const analyzeColumns = (data: any[]): ColumnAnalysis => {
  if (!data || data.length === 0) {
    return {
      totalColumns: 0,
      blankColumns: [],
      populatedColumns: [],
      partiallyFilledColumns: []
    };
  }

  const allHeaders = Object.keys(data[0]);
  const blankColumns: string[] = [];
  const populatedColumns: string[] = [];
  const partiallyFilledColumns: string[] = [];

  allHeaders.forEach(header => {
    const values = data.map(row => row[header]);
    const nonEmptyValues = values.filter(value => 
      value !== null && 
      value !== undefined && 
      value !== '' && 
      value.toString().trim() !== ''
    );

    if (nonEmptyValues.length === 0) {
      // Completely blank column
      blankColumns.push(header);
    } else if (nonEmptyValues.length === values.length) {
      // Completely filled column
      populatedColumns.push(header);
    } else {
      // Partially filled column
      partiallyFilledColumns.push(header);
    }
  });

  return {
    totalColumns: allHeaders.length,
    blankColumns,
    populatedColumns,
    partiallyFilledColumns
  };
};

export const hasExistingEntries = (data: any[], columnName: string): boolean => {
  if (!data || data.length === 0) return false;
  
  const values = data.map(row => row[columnName]);
  const nonEmptyValues = values.filter(value => 
    value !== null && 
    value !== undefined && 
    value !== '' && 
    value.toString().trim() !== ''
  );
  
  return nonEmptyValues.length > 0;
};