import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComentariosService } from './comentario.service';
import { Comentario } from './entities/comentario.entity';
import { ClientProxy } from '@nestjs/microservices';
import { of, lastValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('ComentariosService', () => {
  let service: ComentariosService;
  let comentarioRepository: Repository<Comentario>;
  let clientProxy: ClientProxy;

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
