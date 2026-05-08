import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LocationsQueryRepo } from '../../infrastructure/query/locations-query.repo';

export class GetCountriesWithCitiesQuery {}

@QueryHandler(GetCountriesWithCitiesQuery)
export class GetCountriesWithCitiesHandler implements IQueryHandler<GetCountriesWithCitiesQuery> {
  constructor(private readonly locationsQueryRepo: LocationsQueryRepo) {}

  async execute(): Promise<Record<string, string[]>> {
    return this.locationsQueryRepo.getCountriesWithCities();
  }
}
