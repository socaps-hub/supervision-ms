import { IsString } from "class-validator";
import { InputType, Field } from "@nestjs/graphql";
import { ResFaseII as ResF2 } from "@prisma/client";
import { ResFaseII } from "src/sisconcre/solicitudes/enums/evaluacion-fase2.enum";

@InputType()
export class CreateSisconcapEvaluacionFase3Input {
  @Field(() => String)
  @IsString()
  R24E_id: string;
  
  @Field(() => ResFaseII)
  @IsString()
  R24Res: ResF2;
}
