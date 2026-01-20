import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { GraphQLJSON } from 'graphql-scalars';

// Importa tus módulos
import { SisconcreModule } from './sisconcre/sisconcre.module';
import { CommonModule } from './common/common.module';
import { EstructuraModule } from './estructura/estructura.module';
import { FaseIiiDesembolsoModule } from './fase-iii-desembolso/fase-iii-desembolso.module';
import { FaseIvSegGlobalModule } from './fase-iv-seg-global/fase-iv-seg-global.module';
import { SisconcapModule } from './sisconcap/sisconcap.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      resolvers: { JSON: GraphQLJSON },
    }),
    SisconcreModule,
    CommonModule,
    EstructuraModule,
    FaseIiiDesembolsoModule,
    FaseIvSegGlobalModule,
    SisconcapModule,
    AuditoriaModule,
  ],
})
export class AppModule {
}
