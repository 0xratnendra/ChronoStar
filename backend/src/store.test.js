import { describe, it, expect } from 'vitest';
import { createEventStore, FileEventStore, InMemoryEventStore, PostgresEventStore, SQLiteEventStore } from './store.js';

describe('EventStore Drivers', () => {
  const sampleEvent = { type: 'vault', id: 1, targetLedger: 1000 };

  for (const driverName of ['memory', 'file', 'postgres', 'sqlite']) {
    it(`driver "${driverName}" implements append, load, and list`, async () => {
      const store = createEventStore(driverName);
      const initial = await store.load();
      expect(Array.isArray(initial)).toBe(true);

      const appended = await store.append(sampleEvent);
      expect(appended.length).toBeGreaterThan(0);

      const listed = await store.list(10);
      expect(listed.length).toBeGreaterThan(0);
      expect(listed[0].type).toBe('vault');
    });
  }
});
