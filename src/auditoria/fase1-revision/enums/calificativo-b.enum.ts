import { registerEnumType } from "@nestjs/graphql";

export enum CalificativoBEnum {
    ACEPTABLE = 'ACEPTABLE',
    COMPLETO = 'COMPLETO',
    GRAVE = 'GRAVE',
    PENDIENTE = 'PENDIENTE',
}

// Registros para GraphQL
registerEnumType(CalificativoBEnum, { name: 'CalificativoBEnum' });