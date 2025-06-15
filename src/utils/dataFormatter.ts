
import { CensusData, MasterCensusRecord } from '@/types/census';
import { formatMasterCensusRecord } from './recordFormatter';

export const formatCensusData = async (data: CensusData): Promise<CensusData> => {
  const formattedMasterCensus = data.masterCensus.map(record => formatMasterCensusRecord(record));
  
  return {
    masterCensus: formattedMasterCensus
  };
};
