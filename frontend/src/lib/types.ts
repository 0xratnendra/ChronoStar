export type { VaultEntry, StreamEntry, DCAEntry, ScheduleEvent, Stats } from '@/types';
export type ContractEntry = VaultEntry | StreamEntry | DCAEntry;

export const isContractEntry = (v: unknown): v is ContractEntry =>
  typeof v === 'object' && v !== null && 'id' in v && 'status' in v;
