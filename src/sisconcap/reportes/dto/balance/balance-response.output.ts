import { Field, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class BalanceResponse {

    @Field(() => Int)
    movimientosF1: number
    
    @Field(() => Int)
    anomaliasF1: number
    
    @Field(() => Int)
    movimientosF2: number
    
    @Field(() => Int)
    anomaliasF2: number
    
    @Field(() => Int)
    movimientosF3: number
    
    @Field(() => Int)
    anomaliasF3: number

}