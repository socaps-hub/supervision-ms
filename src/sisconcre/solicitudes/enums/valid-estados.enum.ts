import { registerEnumType } from "@nestjs/graphql";

export enum ValidEstados {

    CON_SEGUIMIENTO = 'Con seguimiento',
    SIN_SEGUIMIENTO = 'Sin seguimiento',
    CON_DESEMBOLSO = 'Con desembolso',
    CON_GLOBAL = 'Con global',

}

registerEnumType( ValidEstados, { name: 'ValidEstados' } )