import {Body, Controller, Post, BadRequestException, Get, Param} from '@nestjs/common';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { DenunciaService } from './denuncia.service';
import { Denuncia } from './entities/denuncia.entity';

@Controller('denuncias')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  async create(@Body() body: CreateDenunciaDto): Promise<Denuncia> {
    try {
      return await this.denunciaService.create(body);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Ocorreu um erro desconhecido.');
    }
  }

  @Get('/all')
  async findAll(): Promise<Denuncia[]> {
    return await this.denunciaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Denuncia> {
    return await this.denunciaService.findOne(id);
  }


}



