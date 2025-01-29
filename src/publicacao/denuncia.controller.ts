import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { Denuncia } from './entities/denuncia.entity';

@Controller('denuncias')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) { }

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

  @Get('byPublicacaoId/:id')
  async findOne(@Param('id') id: number): Promise<Denuncia[]> {
    const result = await this.denunciaService.findByPublicacaoId(id);

    if (!result || result.length === 0) {
      throw new BadRequestException('Denúncia não encontrada.');
    }

    return result;
  }
}
