
import { CensusData, MasterCensusRecord } from '@/types/census';
import { formatMasterCensusRecord } from './recordFormatter';
import { consolidateVoluntaryLifeAmounts } from './recordConsolidator';

export const formatCensusData = async (data: CensusData): Promise<CensusData> => {
  const formattedMasterCensus = data.masterCensus.map(record => formatMasterCensusRecord(record));
  
  // Group records by employee to consolidate voluntary life amounts
  const consolidatedRecords = consolidateVoluntaryLifeAmounts(formattedMasterCensus);
  
  return {
    masterCensus: consolidatedRecords
  };
};
