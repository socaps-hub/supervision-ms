import { registerEnumType } from "@nestjs/graphql";

export enum ValidEstadosAuditoria {

    NO_REVISADO = 'No revisado',
    CON_REVISION = 'Con revision',
    CON_SEGUIMIENTO = 'Con seguimiento',

}

registerEnumType( ValidEstadosAuditoria, { name: 'ValidEstadosAuditoria' } )