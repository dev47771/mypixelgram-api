import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class LocationsQueryRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getCountriesWithCities(): Promise<Record<string, string[]>> {
    const countries = await this.prisma.country.findMany({
      include: {
        cities: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result: Record<string, string[]> = {};

    for (const country of countries) {
      if (!country.cities.length) continue;

      const cityNames = country.cities.map((c) => c.name);
      result[country.name] = cityNames;
    }

    return result;
  }
}
