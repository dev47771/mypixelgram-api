import { parseCountryLine, readLines } from './geonames/utils';

async function main() {
  const countries = await readLines('apps/main/geodata/countryInfo', parseCountryLine, 10);
  countries.forEach((c) => console.log(`${c.code} => ${c.name}`));
  console.log('Done');
}

main().catch(console.error);
