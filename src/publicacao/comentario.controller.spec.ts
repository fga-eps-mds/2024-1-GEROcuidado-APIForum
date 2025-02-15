import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Ordering } from '../shared/decorators/ordenate.decorator';
import { Pagination } from '../shared/decorators/paginate.decorator';
import { ResponsePaginate } from '../shared/interfaces/response-paginate.interface';
import { ComentariosController } from './comentario.controller';
import { ComentariosService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';

describe('ComentariosController', () => {
  let controller: ComentariosController;
  let service: ComentariosService;

  const mockComentario: Comentario = {
    id: 1,
    conteudo: 'Comentário de teste',
    idUsuario: 1,
    dataHora: new Date(),
    publicacao: {} as any, 
  };

  const mockResponsePaginate: ResponsePaginate<Comentario[]> = {
    data: [mockComentario],
    count: 1,
    pageSize: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentariosController],
      providers: [
        {
          provide: ComentariosService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockComentario),
            findAll: jest.fn().mockResolvedValue(mockResponsePaginate),
            findOne: jest.fn().mockResolvedValue(mockComentario),
            update: jest.fn().mockResolvedValue(mockComentario),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ComentariosController>(ComentariosController);
    service = module.get<ComentariosService>(ComentariosService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um comentário com sucesso', async () => {
      const createComentarioDto: CreateComentarioDto = {
        conteudo: 'Comentário de teste',
        idUsuario: 1,
        dataHora: new Date().toISOString(),
        comentarioId: 1,
      };

      const result = await controller.create(createComentarioDto);

      expect(service.create).toHaveBeenCalledWith(createComentarioDto);
      expect(result).toEqual(mockComentario);
    });

    it('deve lançar uma exceção BadRequestException em caso de erro', async () => {
      const createComentarioDto: CreateComentarioDto = {
        conteudo: 'Comentário de teste',
        idUsuario: 1,
        dataHora: new Date().toISOString(),
        comentarioId: 1,
      };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Erro ao criar comentário'));

      await expect(controller.create(createComentarioDto)).rejects.toThrowError(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista paginada de comentários', async () => {
      const pagination: Pagination = { 
        limit: 10, 
        offset: 0,
        getOffset: () => 0,
        getLimit: () => 10 
      };
      const ordering: Ordering = { 
        column: 'id', 
        dir: 'ASC',
        buildOrderParams: () => ({ column: 'id', dir: 'ASC' })
      };

      const result = await controller.findAll(pagination, ordering);

      expect(service.findAll).toHaveBeenCalledWith(ordering, pagination);
      expect(result).toEqual(mockResponsePaginate);
    });
  });

  describe('findOne', () => {
    it('deve retornar um comentário pelo ID', async () => {
      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockComentario);
    });

    it('deve lançar uma exceção BadRequestException em caso de erro', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Erro ao buscar comentário'));

      await expect(controller.findOne('1')).rejects.toThrowError(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar um comentário com sucesso', async () => {
      const updateComentarioDto: UpdateComentarioDto = {
        conteudo: 'Comentário atualizado',
      };

      const result = await controller.update('1', updateComentarioDto);

      expect(service.update).toHaveBeenCalledWith(1, updateComentarioDto);
      expect(result).toEqual(mockComentario);
    });

    it('deve lançar uma exceção BadRequestException em caso de erro', async () => {
      const updateComentarioDto: UpdateComentarioDto = {
        conteudo: 'Comentário atualizado',
      };

      jest.spyOn(service, 'update').mockRejectedValue(new Error('Erro ao atualizar comentário'));

      await expect(controller.update('1', updateComentarioDto)).rejects.toThrowError(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover um comentário com sucesso', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('deve lançar uma exceção BadRequestException em caso de erro', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Erro ao remover comentário'));

      await expect(controller.remove('1')).rejects.toThrowError(BadRequestException);
    });
  });
});