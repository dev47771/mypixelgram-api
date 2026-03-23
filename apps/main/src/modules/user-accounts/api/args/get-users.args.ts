import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

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
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  searchLoginTerm?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  searchIdTerm?: string;

  @Field(() => SortField, { nullable: true, defaultValue: SortField.CREATED_AT })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
