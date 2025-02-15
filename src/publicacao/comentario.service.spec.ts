import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Ordering } from '../shared/decorators/ordenate.decorator';
import { Pagination } from '../shared/decorators/paginate.decorator';
import { ComentariosService } from './comentario.service';
import { Comentario } from './entities/comentario.entity';

describe('ComentariosService', () => {
  let service: ComentariosService;
  let comentarioRepository: Repository<Comentario>;

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
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar uma lista paginada de comentários', async () => {
      const ordering: Ordering = new Ordering('id');
      ordering.dir = 'ASC';
      const paging: Pagination = {
        limit: 10,
        offset: 0,
        getOffset: () => 0,
        getLimit: () => 10,
      };

      // Mock do createQueryBuilder
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockComentario], 1]),
      };

      jest
        .spyOn(comentarioRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder as unknown as SelectQueryBuilder<Comentario>);

      const result = await service.findAll(ordering, paging);

      // Verificações
      expect(comentarioRepository.createQueryBuilder).toHaveBeenCalledWith('comentario');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('comentario.publicacao', 'publicacao');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(paging.limit);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(paging.offset);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(`"${ordering.column}"`, ordering.dir.toUpperCase());
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();

      expect(result).toEqual({
        data: [mockComentario], // Lista de comentários
        count: 1, // Total de registros
        pageSize: paging.limit, // Tamanho da página
      });
    });
  });
});