import type { IncomingMessage } from 'node:http';
import { isIP } from 'node:net';

export interface PublicDemoConfig {
  shortWindowMs: number;
  perIpShortLimit: number;
  perIpDailyLimit: number;
  globalDailyLimit: number;
  maxMessageLength: number;
  timeoutMs: number;
  trustProxy?: boolean;
}

function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, min: number, max: number): number {
  const value = env[key] === undefined ? fallback : Number(env[key]);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${key} must be ${min}..${max}`);
  return value;
}

export function readPublicDemoConfig(env: NodeJS.ProcessEnv = process.env): PublicDemoConfig | undefined {
  if (env.PUBLIC_DEMO_MODE !== 'true') {
    if (env.PUBLIC_DEMO_MODE && env.PUBLIC_DEMO_MODE !== 'false') throw new Error('PUBLIC_DEMO_MODE must be true or false');
    return undefined;
  }
  return {
    shortWindowMs: integer(env, 'PUBLIC_DEMO_WINDOW_MS', 60_000, 1000, 3_600_000),
    perIpShortLimit: integer(env, 'PUBLIC_DEMO_IP_WINDOW_LIMIT', 3, 1, 100),
    perIpDailyLimit: integer(env, 'PUBLIC_DEMO_IP_DAILY_LIMIT', 20, 1, 10_000),
    globalDailyLimit: integer(env, 'PUBLIC_DEMO_GLOBAL_DAILY_LIMIT', 200, 1, 100_000),
    maxMessageLength: integer(env, 'PUBLIC_DEMO_MAX_MESSAGE_LENGTH', 400, 1, 1000),
    timeoutMs: integer(env, 'PUBLIC_DEMO_TIMEOUT_MS', 20_000, 1000, 60_000),
    trustProxy: env.PUBLIC_DEMO_TRUST_PROXY === 'true',
  };
}

export function clientAddress(request: IncomingMessage, trustProxy = false): string {
  if (trustProxy) {
    // The rightmost address is appended by the nearest proxy; never trust a caller-supplied leftmost XFF value.
    const forwarded = request.headers['x-forwarded-for'];
    const candidate = (typeof forwarded === 'string' ? forwarded : '').split(',').at(-1)?.trim() ?? '';
    if (isIP(candidate)) return candidate;
  }
  return request.socket.remoteAddress ?? 'unknown';
}

export function createPublicDemoLimiter(config: PublicDemoConfig, now: () => number = Date.now) {
  const short = new Map<string, number[]>();
  const daily = new Map<string, number>();
  let day = '';
  let global = 0;
  return (address: string): boolean => {
    const timestamp = now();
    const currentDay = new Date(timestamp).toISOString().slice(0, 10);
    if (currentDay !== day) { day = currentDay; global = 0; daily.clear(); short.clear(); }
    const recent = (short.get(address) ?? []).filter(item => timestamp - item < config.shortWindowMs);
    if (recent.length >= config.perIpShortLimit || (daily.get(address) ?? 0) >= config.perIpDailyLimit || global >= config.globalDailyLimit) return false;
    recent.push(timestamp); short.set(address, recent);
    daily.set(address, (daily.get(address) ?? 0) + 1); global++;
    return true;
  };
}
