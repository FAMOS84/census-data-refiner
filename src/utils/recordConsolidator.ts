
import { MasterCensusRecord } from '@/types/census';

export const consolidateVoluntaryLifeAmounts = (records: MasterCensusRecord[]): MasterCensusRecord[] => {
  // Return records in their exact original order without any consolidation or grouping
  // This preserves the sequence that external systems depend on
  return records;
};
