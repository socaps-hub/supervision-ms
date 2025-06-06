import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { LimitePrudencialService } from './limite-prudencial.service';
import { LimitePrudencial } from './entities/limite-prudencial.entity';
import { CreateLimitePrudencialArgs } from './dto/args/create-limite-prudencial.arg';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Resolver(() => LimitePrudencial)
export class LimitePrudencialResolver {
  constructor(private readonly limitePrudencialService: LimitePrudencialService) {}

  @Mutation(() => LimitePrudencial)
  createLimitePrudencial(
    @Args() createLimitePrudencialArgs: CreateLimitePrudencialArgs,
  ) {
    return this.limitePrudencialService.create(createLimitePrudencialArgs);
  }

  @Query(() => LimitePrudencial)
  findLastLimitePrudencial(
    @Args() user: Usuario,
  ) {
    return this.limitePrudencialService.findLast(user);
  }

  // @Query(() => [LimitePrudencial], { name: 'limitePrudencial' })
  // findAll() {
  //   return this.limitePrudencialService.findAll();
  // }

  // @Query(() => LimitePrudencial, { name: 'limitePrudencial' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.limitePrudencialService.findOne(id);
  // }

  // @Mutation(() => LimitePrudencial)
  // updateLimitePrudencial(@Args('updateLimitePrudencialInput') updateLimitePrudencialInput: UpdateLimitePrudencialInput) {
  //   return this.limitePrudencialService.update(updateLimitePrudencialInput.id, updateLimitePrudencialInput);
  // }

  // @Mutation(() => LimitePrudencial)
  // removeLimitePrudencial(@Args('id', { type: () => Int }) id: number) {
  //   return this.limitePrudencialService.remove(id);
  // }
}
