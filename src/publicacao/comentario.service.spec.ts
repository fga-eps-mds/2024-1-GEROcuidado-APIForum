import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComentariosService } from './comentario.service';
import { Comentario } from './entities/comentario.entity';
import { ClientProxy } from '@nestjs/microservices';
import { of, lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('ComentariosService', () => {
  let service: ComentariosService;
  let comentarioRepository: Repository<Comentario>;
  let clientProxy: ClientProxy;

  const mockComentario = {
    id: 1,
    conteudo: 'Comentário de teste',
    idUsuario: 1,
    idPublicacao: 1,
  };

  const mockUsuario = {
    id: 1,
    nome: 'Usuário Teste',
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComentariosService,
        {
          provide: getRepositoryToken(Comentario),
          useValue: {
            create: jest.fn().mockReturnValue(mockComentario),
            save: jest.fn().mockResolvedValue(mockComentario),
            findOneOrFail: jest.fn().mockResolvedValue(mockComentario),
            merge: jest.fn().mockReturnValue(mockComentario),
            remove: jest.fn().mockResolvedValue(mockComentario),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockComentario], 1]),
            })),
          },
        },
        {
          provide: 'USUARIO_CLIENT',
          useValue: {
            send: jest.fn().mockReturnValue(of(mockUsuario)),
          },
        },
      ],
    }).compile();

    service = module.get<ComentariosService>(ComentariosService);
    comentarioRepository = module.get<Repository<Comentario>>(
      getRepositoryToken(Comentario),
    );
    clientProxy = module.get<ClientProxy>('USUARIO_CLIENT');
  });