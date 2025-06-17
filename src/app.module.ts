import { join } from 'path';
import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';

import { SisconcreModule } from './sisconcre/sisconcre.module';
import { CommonModule } from './common/common.module';
import { EstructuraModule } from './estructura/estructura.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
     // debug: false,
      playground: false,
      autoSchemaFile: join( process.cwd(), 'src/schema.gql'),
      plugins: [
        ApolloServerPluginLandingPageLocalDefault(),
      ]
    }),
    SisconcreModule,
    CommonModule,
    EstructuraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
