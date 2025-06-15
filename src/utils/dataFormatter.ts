
import { CensusData, MasterCensusRecord } from '@/types/census';
import { formatMasterCensusRecord, rollUpDependentVoluntaryLife } from './recordFormatter';

export const formatCensusData = async (data: CensusData): Promise<CensusData> => {
  const formattedMasterCensus = data.masterCensus.map(record => formatMasterCensusRecord(record));
  
  // Roll up dependent voluntary life amounts to employee lines
  const rolledUpRecords = rollUpDependentVoluntaryLife(formattedMasterCensus);
  
  return {
    masterCensus: rolledUpRecords
  };
};
