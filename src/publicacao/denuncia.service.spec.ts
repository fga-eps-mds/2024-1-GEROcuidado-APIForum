import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicacaoService } from '../publicacao/publicacao.service'; // Importe o PublicacaoService
import { Ordering } from '../shared/decorators/ordenate.decorator';
import { Pagination } from '../shared/decorators/paginate.decorator';
import { ResponsePaginate } from '../shared/interfaces/response-paginate.interface';
import { DenunciaService } from './denuncia.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { Denuncia } from './entities/denuncia.entity';

describe('DenunciaService', () => {
  let service: DenunciaService;
  let repository: Repository<Denuncia>;
  let publicacaoService: PublicacaoService; // Declare o PublicacaoService

  const mockDenuncia: Denuncia = {
    id: 1,
    idUsuario: 1,
    motivo: 'Conteúdo inadequado',
    descricao: 'Descrição da denúncia',
    dataHora: new Date(),
  };

  const mockResponsePaginate: ResponsePaginate<Denuncia[]> = {
    data: [mockDenuncia],
    count: 1,
    pageSize: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DenunciaService,
        {
          provide: getRepositoryToken(Denuncia),
          useValue: {
            create: jest.fn().mockReturnValue(mockDenuncia),
            save: jest.fn().mockResolvedValue(mockDenuncia),
            findOneOrFail: jest.fn().mockResolvedValue(mockDenuncia),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockDenuncia], 1]),
            })),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PublicacaoService, // Adicione o PublicacaoService como provedor
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // Mock do método findOne
          },
        },
      ],
    }).compile();

    service = module.get<DenunciaService>(DenunciaService);
    repository = module.get<Repository<Denuncia>>(getRepositoryToken(Denuncia));
    publicacaoService = module.get<PublicacaoService>(PublicacaoService); // Obtenha a instância do PublicacaoService
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma denúncia com sucesso', async () => {
      const createDenunciaDto: CreateDenunciaDto = {
        idUsuario: 1,
        motivo: 'Conteúdo inadequado',
        descricao: 'Descrição da denúncia',
        dataHora: new Date().toISOString(),
        publicacaoId: 1, // Adicionando a propriedade publicacaoId
      };

      const result = await service.create(createDenunciaDto);

      expect(publicacaoService.findOne).toHaveBeenCalledWith(1); // Verifique se o método findOne foi chamado
      expect(repository.create).toHaveBeenCalledWith(createDenunciaDto);
      expect(repository.save).toHaveBeenCalledWith(mockDenuncia);
      expect(result).toEqual(mockDenuncia);
    });

    it('deve lançar um erro se ocorrer um problema ao salvar a denúncia', async () => {
      const createDenunciaDto: CreateDenunciaDto = {
        idUsuario: 1,
        motivo: 'Conteúdo inadequado',
        descricao: 'Descrição da denúncia',
        dataHora: new Date().toISOString(),
        publicacaoId: 1, // Adicionando a propriedade publicacaoId
      };

      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Erro ao salvar denúncia'));

      await expect(service.create(createDenunciaDto)).rejects.toThrowError(
        'Erro ao salvar denúncia',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista paginada de denúncias', async () => {
      const ordering: Ordering = new Ordering('id');
      ordering.dir = 'ASC';
      const paging: Pagination = {
        limit: 10,
        offset: 0,
        getOffset: () => 0,
        getLimit: () => 10,
      };

      const result = await service.findAll(ordering, paging);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockResponsePaginate);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma denúncia pelo ID', async () => {
      const result = await service.findOne(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDenuncia);
    });

    it('deve lançar um erro se a denúncia não for encontrada', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockRejectedValue(new Error('Denúncia não encontrada!'));

      await expect(service.findOne(1)).rejects.toThrowError(
        'Denúncia não encontrada!',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma denúncia com sucesso', async () => {
      const updateDenunciaDto: UpdateDenunciaDto = {
        motivo: 'Conteúdo ofensivo',
      };

      const result = await service.update(1, updateDenunciaDto);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith(mockDenuncia);
      expect(result).toEqual(mockDenuncia);
    });

    it('deve lançar um erro se a denúncia não for encontrada', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockRejectedValue(new Error('Denúncia não encontrada!'));

      await expect(service.update(1, { motivo: 'Conteúdo ofensivo' })).rejects.toThrowError(
        'Denúncia não encontrada!',
      );
    });
  });

  describe('remove', () => {
    it('deve remover uma denúncia com sucesso', async () => {
      await service.remove(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockDenuncia);
    });

    it('deve lançar um erro se a denúncia não for encontrada', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockRejectedValue(new Error('Denúncia não encontrada!'));

      await expect(service.remove(1)).rejects.toThrowError(
        'Denúncia não encontrada!',
      );
    });
  });
});