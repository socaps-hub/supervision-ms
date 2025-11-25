import { registerEnumType } from "@nestjs/graphql";

export enum AccionResultadoEnum {
    NO_SOLVENTADO = 'NO_SOLVENTADO',
    SOLVENTADO = 'SOLVENTADO',
}

// Registros para GraphQL
registerEnumType(AccionResultadoEnum, { name: 'AccionResultadoEnum' });