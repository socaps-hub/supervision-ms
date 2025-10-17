import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';

// Importa tus módulos
import { SisconcreModule } from './sisconcre/sisconcre.module';
import { CommonModule } from './common/common.module';
import { EstructuraModule } from './estructura/estructura.module';
import { FaseILevantamientoModule } from './fase-i-levantamiento/fase-i-levantamiento.module';
import { FaseIiSeguimientoModule } from './fase-ii-seguimiento/fase-ii-seguimiento.module';
import { FaseIiiDesembolsoModule } from './fase-iii-desembolso/fase-iii-desembolso.module';
import { FaseIvSegGlobalModule } from './fase-iv-seg-global/fase-iv-seg-global.module';
import { SisconcapModule } from './sisconcap/sisconcap.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    SisconcreModule,
    CommonModule,
    EstructuraModule,
    FaseILevantamientoModule,
    FaseIiSeguimientoModule,
    FaseIiiDesembolsoModule,
    FaseIvSegGlobalModule,
    SisconcapModule,
  ],
})
export class AppModule {
}
