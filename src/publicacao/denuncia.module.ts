// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Denuncia } from './entities/denuncia.entity';
// import { DenunciaController } from './denuncia.controller';
// import { DenunciaService } from './denuncia.service';
// import {PublicacaoService} from "../publicacao/publicacao.service";
// import {Publicacao} from "../publicacao/entities/publicacao.entity";
// import {PublicacaoModule} from "../publicacao/publicacao.module";

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Denuncia, Publicacao]),
//     PublicacaoModule
//   ],
//   controllers: [DenunciaController],
//   providers: [DenunciaService, Repository, PublicacaoService],
//   exports: [DenunciaService],
// })
// export class DenunciaModule {}
