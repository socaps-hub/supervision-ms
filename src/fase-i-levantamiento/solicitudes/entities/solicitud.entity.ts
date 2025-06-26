import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Categoria } from 'src/common/entities/categoria.entity';
import { Cooperativa } from 'src/common/entities/cooperativa.entity';
import { Producto } from 'src/common/entities/producto.entity';
import { Sucursal } from 'src/common/entities/sucursal.entity';
import { Usuario } from 'src/common/entities/usuario.entity';

@ObjectType()
export class Prestamo {

  @Field(() => ID)
  R01NUM: string;
  
  @Field(() => ID)
  R01Suc_id: string;

  @Field(() => String)
  R01Nso: string;

  @Field(() => String)
  R01Nom: string;

  @Field(() => ID)
  R01Cat_id: string;

  @Field(() => ID)
  R01Pro_id: string;

  @Field(() => Float)
  R01Imp: number;

  @Field(() => String)
  R01Dir: string;

  @Field(() => ID)
  R01SP_id: string;

  @Field(() => ID)
  R01Ejvo_id: string;

  @Field(() => String)
  R01Fsol: string;

  @Field(() => String)
  R01FRec: string;

  @Field(() => String)
  R01FRev: string;

  @Field(() => String)
  R01FMov: string;

  @Field(() => String, { nullable: true })
  R01ObsA?: string;

  @Field(() => String, { nullable: true })
  R01ObsM?: string;

  @Field(() => String, { nullable: true })
  R01ObsB?: string;

  @Field(() => String, { nullable: true })
  R01ObsT?: string;

  @Field(() => String)
  R01Est: string;

  @Field(() => Boolean)
  R01Activ: boolean;

  @Field(() => ID)
  R01Coop_id: string;

  @Field(() => GraphQLISODateTime)
  R01Creado_en: Date;

  @Field(() => GraphQLISODateTime)
  R01Actualizado_en: Date;

  // Relaciones

  @Field(() => Sucursal, { nullable: true })
  sucursal?: Sucursal;

  @Field(() => Usuario, { nullable: true })
  supervisor?: Usuario;

  @Field(() => Usuario, { nullable: true })
  ejecutivo?: Usuario;

  @Field(() => Producto, { nullable: true })
  producto?: Producto;

  @Field(() => Categoria, { nullable: true })
  categoria?: Categoria;

  @Field(() => Cooperativa, { nullable: true })
  cooperativa?: Cooperativa;

  // Puedes incluir campos virtuales para resumen/evaluaciones si quieres resolverlos directamente
}
