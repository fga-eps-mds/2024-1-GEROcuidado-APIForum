import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { ComentariosService } from './comentario.service';
import { Comentario } from './entities/comentario.entity';

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
            createQueryBuilder: jest.fn(() => {
              const queryBuilder: any = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[mockComentario], 1]),
              };
              return queryBuilder;
            }),
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

   it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um comentário com sucesso', async () => {
      const createComentarioDto = {
        conteudo: 'Comentário de teste',
        idUsuario: 1,
        idPublicacao: 1,
        dataHora: new Date().toISOString(),
        comentarioId: 1,
      };

      const result = await service.create(createComentarioDto);

      expect(comentarioRepository.create).toHaveBeenCalledWith(createComentarioDto);
      expect(comentarioRepository.save).toHaveBeenCalledWith(mockComentario);
      expect(result).toEqual(mockComentario);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista paginada de comentários', async () => {
      const ordering = { column: 'id', dir: 'ASC' };
      const paging = { limit: 10, offset: 0 };
  
      // Mock do createQueryBuilder
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockComentario], 1]), // Retorna uma lista de comentários e o total
      };
  
      jest
        .spyOn(comentarioRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);
  
      const result = await service.findAll(ordering, paging);
  
      expect(comentarioRepository.createQueryBuilder).toHaveBeenCalledWith('comentario');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('comentario.publicacao', 'publicacao');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(paging.limit);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(paging.offset);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(`"${ordering.column}"`, ordering.dir.toUpperCase());
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
  
      expect(result).toEqual({
        data: [mockComentario], 
        count: 1, 
        pageSize: paging.limit, 
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um comentário com informações do usuário', async () => {
      const result = await service.findOne(1);

      expect(comentarioRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(clientProxy.send).toHaveBeenCalledWith(
        { role: 'info', cmd: 'get' },
        { id: mockComentario.idUsuario },
      );
      expect(result).toEqual({
        ...mockComentario,
        usuario: mockUsuario,
      });
    });

    it('deve lançar uma exceção NotFoundException se o comentário não for encontrado', async () => {
      jest.spyOn(comentarioRepository, 'findOneOrFail').mockRejectedValue(new NotFoundException());

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um comentário com sucesso', async () => {
      const updateComentarioDto = { conteudo: 'Comentário atualizado' };

      const result = await service.update(1, updateComentarioDto);

      expect(comentarioRepository.merge).toHaveBeenCalledWith(mockComentario, updateComentarioDto);
      expect(comentarioRepository.save).toHaveBeenCalledWith(mockComentario);
      expect(result).toEqual(mockComentario);
    });
  });

  describe('remove', () => {
    it('deve remover um comentário com sucesso', async () => {
      await service.remove(1);

      expect(comentarioRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(comentarioRepository.remove).toHaveBeenCalledWith(mockComentario);
    });
  });
});