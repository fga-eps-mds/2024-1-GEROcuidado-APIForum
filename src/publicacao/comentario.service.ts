import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom, timeout } from 'rxjs';
import { Repository } from 'typeorm';
import { Ordering } from '../shared/decorators/ordenate.decorator';
import { Pagination } from '../shared/decorators/paginate.decorator';
import { ResponsePaginate } from '../shared/interfaces/response-paginate.interface';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';
import { IUsuario } from './interface/publicacao-usuario.interface';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    @Inject('USUARIO_CLIENT') private readonly client: ClientProxy, // Injeção correta do ClientProxy
  ) {}

  async create(createComentarioDto: CreateComentarioDto): Promise<Comentario> {
    const comentario = new Comentario(createComentarioDto);
    return await this.comentarioRepository.save(comentario);
  }

  async findAll(
    ordering: Ordering,
    paging: Pagination,
  ): Promise<ResponsePaginate<Comentario[]>> {
    const limit = paging.limit;
    const offset = paging.offset;
    const sort = ordering.column;
    const order = ordering.dir.toUpperCase() as 'ASC' | 'DESC';

    const [result, total] = await this.comentarioRepository
      .createQueryBuilder('comentario')
      .leftJoinAndSelect('comentario.publicacao', 'publicacao')
      .limit(limit)
      .offset(offset)
      .orderBy(`"${sort}"`, order)
      .getManyAndCount();

    return {
      data: result,
      count: +total,
      pageSize: +limit,
    };
  }

  async findOne(id: number): Promise<Comentario & { usuario: IUsuario }> {
    const comentario = await this.comentarioRepository.findOneOrFail({
      where: { id },
    });

    // Usando o ClientProxy para buscar informações do usuário
    const request = this.client
      .send({ role: 'info', cmd: 'get' }, { id: comentario.idUsuario })
      .pipe(timeout(5000));
    const usuario = await lastValueFrom(request);

    if (!comentario) {
      throw new NotFoundException(`Comentário com ID ${id} não encontrado`);
    }

    // Retorna o comentário com as informações do usuário
    return { ...comentario, usuario };
  }

  async update(
    id: number,
    updateComentarioDto: UpdateComentarioDto,
  ): Promise<Comentario> {
    const comentario = await this.findOne(id);
    this.comentarioRepository.merge(comentario, updateComentarioDto);
    return await this.comentarioRepository.save(comentario);
  }

  async remove(id: number): Promise<void> {
    const comentario = await this.findOne(id);
    await this.comentarioRepository.remove(comentario);
  }
}