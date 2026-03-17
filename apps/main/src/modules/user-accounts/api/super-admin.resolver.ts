import { General } from '../../graph-ql/models/general.model';
import { Resolver } from '@nestjs/graphql';

@Resolver(() => General)
export class SuperAdminResolver {}
