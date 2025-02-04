import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateComentarioDto {
    @IsNotEmpty()
  @IsNumber()
  idUsuario!: number;

  @IsNotEmpty()
  @IsString()
  motivo!: string;

  @IsNotEmpty()
  @IsString()
  comentarioTexto!: string;

  @IsNotEmpty()
  @IsDateString()
  dataHora!: string;

  @IsNotEmpty()
  @IsNumber()
  comentarioId!: number;

}
