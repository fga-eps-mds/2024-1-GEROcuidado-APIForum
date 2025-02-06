import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicacaoModule } from '../publicacao/publicacao.module';
import { ComentariosController } from './comentario.controller';
import { ComentariosService } from './comentario.service';
import { Comentario } from './entities/comentario.entity';
import { Publicacao } from './entities/publicacao.entity';

@Module({
  imports: [
    // Importe as entidades Comentario e Publicacao
    TypeOrmModule.forFeature([Comentario, Publicacao]),

    // Importe o PublicacaoModule para usar o PublicacaoService
    PublicacaoModule,

    // Configure o ClientProxy para comunicação com microserviços
    ClientsModule.registerAsync([
      {
        name: 'USUARIO_CLIENT', // Nome do cliente (deve corresponder ao usado no serviço)
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP, // Ou Transport.RMQ, Transport.KAFKA, etc.
          options: {
            host: configService.get('AUTH_HOST'), // Host do microserviço
            port: configService.get('AUTH_PORT'), // Porta do microserviço
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}