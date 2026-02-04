import * as fs from 'fs';
import * as readline from 'readline';

export type CountryRow = { code: string; name: string };
export type CityRow = { countryCode: string; name: string; population: number | null };

export function parseCountryLine(line: string): CountryRow | null {
  if (!line || line.startsWith('#')) return null;
  const parts = line.split('\t');
  const code = parts[0];
  const name = parts[4];
  if (!code || !name) return null;
  return { code, name };
}

export function parseCityLine(line: string): CityRow | null {
  if (!line || line.startsWith('#')) return null;
  const parts = line.split('\t');
  const featureClass = parts[6];
  if (featureClass !== 'P') return null;
  const name = parts[1];
  const countryCode = parts[8];
  const population = parts[14] ? Number(parts[14]) : null;
  if (!name || !countryCode) return null;
  return { name, countryCode, population: Number.isFinite(population!) ? population : null };
}

export async function readLines<T>(filePath: string, mapFn: (line: string) => T | null, limit?: number): Promise<T[]> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const out: T[] = [];
  for await (const line of rl) {
    const mapped = mapFn(line);
    if (mapped) out.push(mapped);
    if (limit && out.length >= limit) break;
  }
  rl.close();
  return out;
}
