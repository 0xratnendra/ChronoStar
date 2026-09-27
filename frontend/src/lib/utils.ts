const SECONDS_PER_LEDGER = 5;

export function ledgersToHuman(ledgers: number): string {
  if (ledgers <= 0) return 'now';
  const seconds = ledgers * SECONDS_PER_LEDGER;
  if (seconds < 3600) return `~${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `~${(seconds / 3600).toFixed(1).replace(/\.0$/, '')} hours`;
  return `~${(seconds / 86400).toFixed(1).replace(/\.0$/, '')} days`;
}
