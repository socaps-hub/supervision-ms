import { registerEnumType } from "@nestjs/graphql";

export enum FiguraEnum {
    MENOR = 'MENOR',
    SOCIO = 'SOCIO',
}

registerEnumType(FiguraEnum, { name: 'FiguraEnum' });
