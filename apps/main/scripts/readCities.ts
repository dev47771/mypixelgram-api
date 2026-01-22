import { parseCityLine, readLines } from './geonames/utils';

async function main() {
  const rows = await readLines('apps/main/geodata/cities15000.txt', parseCityLine);
  const sample = rows.filter((r) => r.countryCode === 'AD' || r.countryCode === 'AE').slice(0, 10);
  sample.forEach((r) => console.log(`${r.countryCode} => ${r.name} (${r.population ?? 'n/a'})`));
  console.log('Done');
}

main().catch(console.error);
