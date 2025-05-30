import { join } from 'path';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { AuthModule } from './auth/auth.module';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';

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
    UsuariosModule,
    SucursalesModule,
    AuthModule,
    CooperativasModule,
    ProductosModule,
    CategoriasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
