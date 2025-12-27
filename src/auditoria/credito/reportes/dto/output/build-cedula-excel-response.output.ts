import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class BuildCedulaExcelResponse {
  @Field(() => String)
  url: string;

  @Field(() => Int)
  totalRegistros: number;
}
