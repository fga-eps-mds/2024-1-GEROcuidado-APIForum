import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosService } from './comentario.service';
import { ComentariosController } from './comentario.controller';
import { Comentario } from './entities/comentario.entity';  
import { Publicacao } from './entities/publicacao.entity';
import {PublicacaoService} from "../publicacao/publicacao.service";
import {PublicacaoModule} from "../publicacao/publicacao.module";

@Module({
    imports: [TypeOrmModule.forFeature([Comentario, Publicacao]), 
    PublicacaoModule
],
    controllers: [ComentariosController],
    providers: [ComentariosService, PublicacaoService],
    exports: [ComentariosService],
})
export class ComentariosModule {}