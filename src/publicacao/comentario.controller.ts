// Arquivo: comentario.controller.ts falta reajustes.
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ComentariosService } from './comentario.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';  
import { BadRequestException } from '@nestjs/common';
import { Paginate, Pagination } from '../shared/decorators/paginate.decorator';
import { Ordenate, Ordering } from '../shared/decorators/ordenate.decorator';
import { ResponsePaginate } from '../shared/interfaces/response-paginate.interface';

@Controller('comentarios')
export class ComentariosController {
    constructor(private readonly comentariosService: ComentariosService) {}

    @Post()
      async create(@Body() body: CreateComentarioDto): Promise<Comentario> {
        try {
          return await this.comentariosService.create(body);
        } catch (error) {
          if (error instanceof Error) {
            throw new BadRequestException(error.message);
          }
          throw new BadRequestException('Ocorreu um erro desconhecido.');
        }
      }

    @Get('all')
      async findAll(
        @Paginate() pagination: Pagination,
        @Ordenate() ordering: Ordering,
      ): Promise<ResponsePaginate<Comentario[]>> {
        return this.comentariosService.findAll(ordering, pagination);
      }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.comentariosService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateComentarioDto: UpdateComentarioDto) {
        return this.comentariosService.update(+id, updateComentarioDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.comentariosService.remove(+id);
    }
}