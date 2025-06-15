import { MasterCensusRecord } from '@/types/census';

export const consolidateVoluntaryLifeAmounts = (records: MasterCensusRecord[]): MasterCensusRecord[] => {
  // Process records in their original order to maintain sequence
  const processedRecords: MasterCensusRecord[] = [];
  const processedIndices = new Set<number>();
  
  for (let i = 0; i < records.length; i++) {
    if (processedIndices.has(i)) continue;
    
    const record = records[i];
    
    if (record.relationship === 'Employee') {
      // Find all dependents that belong to this employee
      const dependents: { record: MasterCensusRecord; index: number }[] = [];
      
      // Look for dependents with matching last name immediately following the employee
      for (let j = i + 1; j < records.length; j++) {
        const potentialDependent = records[j];
        
        // Stop looking when we hit another employee
        if (potentialDependent.relationship === 'Employee') {
          break;
        }
        
        // Check if this dependent belongs to the current employee
        if (potentialDependent.memberLastName === record.memberLastName) {
          dependents.push({ record: potentialDependent, index: j });
        }
      }
      
      // Consolidate voluntary life amounts from dependents to employee
      let consolidatedSpouseVolume = record.spouseVolumeAmount || 0;
      let consolidatedDependentVolume = record.dependentVolume || '0';
      
      dependents.forEach(({ record: dependent }) => {
        if (dependent.relationship === 'Spouse' || dependent.relationship === 'Domestic Partner') {
          if (dependent.spouseVolumeAmount) {
            consolidatedSpouseVolume = Math.max(consolidatedSpouseVolume, dependent.spouseVolumeAmount);
          }
        } else if (dependent.relationship === 'Child') {
          if (dependent.dependentVolume && dependent.dependentVolume !== '0' && dependent.dependentVolume !== 'W') {
            consolidatedDependentVolume = dependent.dependentVolume;
          }
        }
      });
      
      // Update employee record with consolidated amounts
      const updatedEmployee = {
        ...record,
        spouseVolumeAmount: consolidatedSpouseVolume,
        dependentVolume: consolidatedDependentVolume
      };
      
      processedRecords.push(updatedEmployee);
      processedIndices.add(i);
      
      // Add dependents with only basic info (Name, DOB, Disabled, Address) in their original order
      dependents.forEach(({ record: dependent, index }) => {
        const cleanedDependent = {
          ...dependent,
          // Clear out benefit elections for dependents - keep only personal info
          dentalPlanElection: undefined,
          dentalCoverageType: undefined,
          dhmoProviderName: undefined,
          dentalPriorCarrierName: undefined,
          dentalPriorCarrierEffectiveDate: undefined,
          dentalPriorCarrierTermDate: undefined,
          dentalPriorCarrierOrtho: undefined,
          visionPlanElection: undefined,
          visionCoverageType: undefined,
          basicLifeCoverageType: undefined,
          primaryLifeBeneficiary: undefined,
          dependentBasicLife: undefined,
          lifeADDClass: undefined,
          employeeVolumeAmount: undefined,
          spouseVolumeAmount: undefined,
          dependentVolume: undefined,
          std: undefined,
          ltd: undefined,
          stdClass: undefined,
          ltdClass: undefined,
          salaryType: undefined,
          salaryAmount: undefined,
          occupation: undefined,
          hoursWorked: undefined,
          workingLocation: undefined,
          billingDivision: undefined,
          dateOfHire: undefined
        };
        processedRecords.push(cleanedDependent);
        processedIndices.add(index);
      });
    }
  }
  
  // Add any remaining unprocessed records (standalone records)
  for (let i = 0; i < records.length; i++) {
    if (!processedIndices.has(i)) {
      processedRecords.push(records[i]);
    }
  }
  
  return processedRecords;
};
