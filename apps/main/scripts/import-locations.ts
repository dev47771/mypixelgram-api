import { PrismaClient } from '@prisma/client';
import { parseCountryLine, parseCityLine, readLines } from './geonames/utils';

const prisma = new PrismaClient();

async function importCountries() {
  const countries = await readLines('apps/main/geodata/countryInfo', parseCountryLine);

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: { code: c.code, name: c.name },
    });
  }

  console.log('Countries imported:', countries.length);
}

async function importCities(minPopulation = 50000) {
  const cities = await readLines('apps/main/geodata/cities15000.txt', parseCityLine);

  const filtered = cities.filter((c) => (c.population ?? 0) >= minPopulation);

  const countryCache = new Map<string, number>();

  for (const c of filtered) {
    let countryId = countryCache.get(c.countryCode);

    if (!countryId) {
      const country = await prisma.country.findUnique({
        where: { code: c.countryCode },
      });
      if (!country) continue;
      countryId = country.id;
      countryCache.set(c.countryCode, countryId);
    }

    await prisma.city.create({
      data: {
        name: c.name,
        population: c.population,
        countryId,
      },
    });
  }

  console.log('Cities imported (>=', minPopulation, '):', filtered.length);
}

async function main() {
  await importCountries();
  await importCities(50000);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
