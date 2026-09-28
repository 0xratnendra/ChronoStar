'use client';

import { useEffect, useState } from 'react';

export interface StreamUpdateData {
  timestamp: string;
  status: string;
  vaultCount?: number;
  streamCount?: number;
  dcaCount?: number;
  [key: string]: unknown;
}

export type StreamCallback = (data: StreamUpdateData) => void;

export class StreamConsumer {
  private eventSource: EventSource | null = null;
  private url: string;
  private listeners: Set<StreamCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay = 2000;

  constructor(url = '/api/stream') {
    this.url = url;
  }

  public connect(): void {
    if (typeof window === 'undefined' || this.eventSource) return;

    try {
      this.eventSource = new EventSource(this.url);

      this.eventSource.addEventListener('schedule-update', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as StreamUpdateData;
          this.notify(parsed);
        } catch (err) {
          console.error('Failed to parse SSE event data', err);
        }
      });

      this.eventSource.onerror = () => {
        this.disconnect();
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error('Failed to initialize EventSource', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public subscribe(callback: StreamCallback): () => void {
    this.listeners.add(callback);
    if (this.listeners.size === 1) {
      this.connect();
    }
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  private notify(data: StreamUpdateData): void {
    this.listeners.forEach((callback) => callback(data));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || this.listeners.size === 0) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, this.reconnectDelay);
  }
}

export function useStreamConsumer(url = '/api/stream') {
  const [data, setData] = useState<StreamUpdateData | null>(null);

  useEffect(() => {
    const consumer = new StreamConsumer(url);
    const unsubscribe = consumer.subscribe((update) => {
      setData(update);
    });

    return () => {
      unsubscribe();
    };
  }, [url]);

  return data;
}
