import { registerEnumType } from '@nestjs/graphql';

export enum ResFaseIII {
  C = 'C',
  I = 'I',
  NA = 'NA',
  P = 'P',
}


registerEnumType(ResFaseIII, {
  name: 'ResFaseIII',
});
