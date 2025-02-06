import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { Comentario } from './entities/comentario.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import {
    IUsuario,
  } from './interface/publicacao-usuario.interface';
import { Pagination } from '../shared/decorators/paginate.decorator';
import { Ordering } from '../shared/decorators/ordenate.decorator';
import { ResponsePaginate } from '../shared/interfaces/response-paginate.interface';

@Injectable()
export class ComentariosService {
    constructor(
        @InjectRepository(Comentario)
        private readonly comentarioRepository: Repository<Comentario>,
        private readonly _client: ClientProxy,
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

    async findOne(id: number): Promise<Comentario> {
        const comentario = await this.comentarioRepository.findOneOrFail({
            where: { id }});

        const request = this._client
        .send({ role: 'info', cmd: 'get' }, { id: comentario.idUsuario })
        .pipe(timeout(5000));
        const usuario = await lastValueFrom(request);

        if (!comentario) {
            throw new NotFoundException(`Comentário com ID ${id} não encontrado`);
        }
            const comentarioWithUsuario = { ...comentario, usuario } as Comentario & { usuario: IUsuario };
            return comentarioWithUsuario;
        }

    async update(id: number, updateComentarioDto: UpdateComentarioDto): Promise<Comentario> {
        const comentario = await this.findOne(id);
        this.comentarioRepository.merge(comentario, updateComentarioDto);
        return await this.comentarioRepository.save(comentario);
    }

    async remove(id: number): Promise<void> {
        const comentario = await this.findOne(id);
        await this.comentarioRepository.remove(comentario);
    }
}