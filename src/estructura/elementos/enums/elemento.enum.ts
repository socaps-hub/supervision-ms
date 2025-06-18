import { registerEnumType } from '@nestjs/graphql';

export enum Impacto {
  ALTO = 'ALTO',
  MEDIO = 'MEDIO',
  BAJO = 'BAJO',
}

registerEnumType(Impacto, { name: 'Impacto' });
