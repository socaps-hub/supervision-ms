import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CooperativasService } from './cooperativas.service';
import { Cooperativa } from './entities/cooperativa.entity';
import { CreateCooperativaInput } from './dto/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/update-cooperativa.input';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => Cooperativa)
export class CooperativasResolver {

  constructor(
    private readonly cooperativasService: CooperativasService
  ) {}

  // @Mutation(() => Cooperativa)
  // createCooperativa(@Args('createCooperativaInput') createCooperativaInput: CreateCooperativaInput) {
  //   return this.cooperativasService.create(createCooperativaInput);
  // }

  @Query(() => [Cooperativa], { name: 'cooperativas' })
  findAll() {
    return this.cooperativasService.findAll();
  }

  @Query(() => Cooperativa, { name: 'cooperativa' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string
  ) {
    return this.cooperativasService.findOne(id);
  }

  // @Mutation(() => Cooperativa)
  // updateCooperativa(@Args('updateCooperativaInput') updateCooperativaInput: UpdateCooperativaInput) {
  //   return this.cooperativasService.update(updateCooperativaInput.id, updateCooperativaInput);
  // }

  // @Mutation(() => Cooperativa)
  // removeCooperativa(@Args('id', { type: () => Int }) id: number) {
  //   return this.cooperativasService.remove(id);
  // }
}
