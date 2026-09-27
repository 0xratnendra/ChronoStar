import { Router } from 'express';

export function createLiveStreamRouter(clients, log, pollIntervalMs = 5000) {
  const router = Router();

  router.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    res.write(': connected\n\n');

    const sendUpdate = async () => {
      try {
        const stats = {
          timestamp: new Date().toISOString(),
          status: 'ok',
        };

        if (clients && clients.vault) {
          try {
            const vaultCount = await clients.vault.client.readContract(
              clients.vault.contractId,
              'vault_count',
              [],
            );
            stats.vaultCount = vaultCount !== undefined ? Number(vaultCount) : 0;
          } catch {
            // ignore rpc error in stream pulse
          }
        }

        res.write(`event: schedule-update\ndata: ${JSON.stringify(stats)}\n\n`);
      } catch (err) {
        if (log) {
          log.warn({ err: err.message }, 'SSE stream update failed');
        }
      }
    };

    // Initial update
    await sendUpdate();

    const updateInterval = setInterval(sendUpdate, pollIntervalMs);
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(updateInterval);
      clearInterval(heartbeatInterval);
      res.end();
    });
  });

  return router;
}
