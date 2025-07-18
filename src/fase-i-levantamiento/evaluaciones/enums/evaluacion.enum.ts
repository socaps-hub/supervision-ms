// enums/evaluacion.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum ResFaseI {
  C = 'C',  // Correcto
  I = 'I',  // Incorrecto
  NA = 'NA' // No Aplica
}

export enum Calificativo {
  CORRECTO = 'CORRECTO',
  ACEPTABLE = 'ACEPTABLE',
  DEFICIENTE = 'DEFICIENTE',
  PENDIENTE = 'PENDIENTE'
}

export enum Resolucion {
  PASA_COMITE = 'PASA_COMITE',
  DEVUELTA = 'DEVUELTA'
}

// Registros para GraphQL
registerEnumType(ResFaseI, { name: 'ResFaseI' });
registerEnumType(Calificativo, { name: 'Calificativo' });
registerEnumType(Resolucion, { name: 'Resolucion' });
