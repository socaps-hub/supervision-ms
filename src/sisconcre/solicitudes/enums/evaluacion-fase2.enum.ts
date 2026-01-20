import { registerEnumType } from '@nestjs/graphql';

export enum ResFaseII {
  S = 'S',
  NS = 'NS',
  C = 'C',
  NA = 'NA',
}


registerEnumType(ResFaseII, {
  name: 'ResFaseII',
});
