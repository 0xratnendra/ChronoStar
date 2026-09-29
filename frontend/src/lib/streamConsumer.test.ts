import { describe, it, expect, vi } from 'vitest';
import { StreamConsumer } from './streamConsumer';

describe('StreamConsumer', () => {
  it('instantiates and manages subscribers', () => {
    const consumer = new StreamConsumer('/api/stream');
    const callback = vi.fn();

    const unsubscribe = consumer.subscribe(callback);
    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });
});
