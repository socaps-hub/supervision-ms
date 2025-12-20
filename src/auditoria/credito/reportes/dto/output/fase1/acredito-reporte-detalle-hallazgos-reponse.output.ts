import { Field, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class ElementoHallazgoDto {
    @Field(() => String)
    elemento: string;

    @Field(() => String)
    impacto: string;

    @Field(() => Int)
    total: number;
}

@ObjectType()
export class RubroHallazgoDto {
  @Field(() => String)
  rubro: string;

  @Field(() => Int)
  total: number;

  @Field(() => [ElementoHallazgoDto])
  elementos: ElementoHallazgoDto[];
}

@ObjectType()
export class EjecutivoHallazgoDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  nombre: string;

  @Field(() => Int)
  totalCreditos: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => [RubroHallazgoDto])
  rubros: RubroHallazgoDto[];
}

@ObjectType()
export class SucursalHallazgoDto {
  @Field(() => String)
  id: string;

  @Field()
  nombre: string;

  @Field(() => Int)
  totalCreditos: number;
    
  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => [RubroHallazgoDto])
  rubros: RubroHallazgoDto[];

  @Field(() => [EjecutivoHallazgoDto])
  ejecutivos: EjecutivoHallazgoDto[];
}

@ObjectType()
export class ReporteHallazgosF1Response {
    @Field(() => Int)   
    totalCreditosGlobal: number;

    @Field(() => Int)   
    totalHallazgosGlobal: number;

    @Field(() => [SucursalHallazgoDto])
    sucursales: SucursalHallazgoDto[];
}
