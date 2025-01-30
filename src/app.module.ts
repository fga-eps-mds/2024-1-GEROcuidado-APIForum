import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutenticacaoGuard } from './autenticacao.guard';
import { DbService } from './config/db/db.service';
import { DenunciaModule } from './publicacao/denuncia.module';
import { PublicacaoModule } from './publicacao/publicacao.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, DbModule],
      useClass: DbService,
    }),
    ClientsModule.registerAsync([
      {
        name: 'USUARIO_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST'),
            port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PublicacaoModule,
    DenunciaModule,

  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AutenticacaoGuard,
    },
  ],
})
export class AppModule { }
