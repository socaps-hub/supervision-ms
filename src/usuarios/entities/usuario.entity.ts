import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Usuario {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
