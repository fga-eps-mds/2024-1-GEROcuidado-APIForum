import {Inject, Injectable, forwardRef} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Denuncia } from "./entities/denuncia.entity";
import { CreateDenunciaDto } from "./dto/create-denuncia.dto";
import { UpdateDenunciaDto } from "./dto/update-denuncia.dto";
import { PublicacaoService } from "../publicacao/publicacao.service";

@Injectable()
export class DenunciaService {
  constructor(
    @InjectRepository(Denuncia)
    private readonly _repository: Repository<Denuncia>,

    @Inject(forwardRef(() => PublicacaoService))
    private readonly _publicacaoService: PublicacaoService, // Injeção do serviço de publicação
  ) {}

  /**
   * Cria uma denúncia para uma publicação com base em um DTO.
   * @param body Dados da denúncia.
   */
  async create(body: CreateDenunciaDto): Promise<Denuncia> {

    const publicacao = await this._publicacaoService.findOne(body.publicacaoId);

    if (!publicacao) {
      throw new Error('Publicação não encontrada!');
    }

    const denuncia = this._repository.create({
      ...body,
      publicacao,
    });

    return this._repository.save(denuncia);
  }


  /**
   * Lista todas as denúncias.
   */
  async findAll(): Promise<Denuncia[]> {
    return this._repository.find();
  }

  /**
   * Busca uma denúncia específica pelo ID.
   * @param id ID da denúncia.
   */
  async findOne(id: number): Promise<Denuncia> {
    return this._repository.findOneOrFail({ where: { id } });
  }

  /**
   * Atualiza os detalhes de uma denúncia.
   * @param id ID da denúncia.
   * @param body Dados da atualização.
   */
  async update(id: number, body: UpdateDenunciaDto): Promise<Denuncia> {
    const denuncia = await this._repository.findOneOrFail({ where: { id } });
    const updated = Object.assign(denuncia, body);
    return this._repository.save(updated);
  }

  /**
   * Remove uma denúncia pelo ID.
   * @param id ID da denúncia.
   */
  async remove(id: number): Promise<void> {
    const denuncia = await this._repository.findOneOrFail({ where: { id } });
    await this._repository.remove(denuncia);
  }
}
