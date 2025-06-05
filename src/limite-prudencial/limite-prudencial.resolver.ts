import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { LimitePrudencialService } from './limite-prudencial.service';
import { LimitePrudencial } from './entities/limite-prudencial.entity';
import { CreateLimitePrudencialInput } from './dto/create-limite-prudencial.input';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { AuthGraphQLGuard } from 'src/auth/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/auth/decorators/user-graphql.decorator';

@Resolver(() => LimitePrudencial)
@UseGuards( AuthGraphQLGuard )
export class LimitePrudencialResolver {
  constructor(private readonly limitePrudencialService: LimitePrudencialService) {}

  @Mutation(() => LimitePrudencial)
  createLimitePrudencial(
    @Args('createLimitePrudencialInput') createLimitePrudencialInput: CreateLimitePrudencialInput,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.limitePrudencialService.create(createLimitePrudencialInput, user);
  }

  @Query(() => LimitePrudencial)
  findLastLimitePrudencial(
    @GetUserGraphQL() user: Usuario,
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
