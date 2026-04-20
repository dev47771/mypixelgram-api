import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  ID = 'id',
  LOGIN = 'login',
  CREATED_AT = 'createdAt',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction (ascending or descending)',
});

registerEnumType(SortField, {
  name: 'SortField',
  description: 'Field to sort by',
});

@ArgsType()
export class GetUsersArgs {
  @Field(() => Number, { nullable: true, defaultValue: 1, description: 'Номер страницы' })
  @IsOptional()
  @IsNumber()
  pageNumber?: number;

  @Field(() => Number, { nullable: true, defaultValue: 8, description: 'Размер страницы' })
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @Field(() => String, { nullable: true, description: 'Поиск по логину или полному имени (частичное совпадение)' })
  @IsString()
  @IsOptional()
  searchLoginTerm?: string;

  @Field(() => String, { nullable: true, description: 'Точный поиск по ID пользователя' })
  @IsString()
  @IsOptional()
  searchIdTerm?: string;

  @Field(() => SortField, { nullable: true, defaultValue: SortField.CREATED_AT, description: 'Поле для сортировки: CREATED_AT, LOGIN, ID' })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC, description: 'Направление сортировки: ASC (возрастание) или DESC (убывание)' })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
