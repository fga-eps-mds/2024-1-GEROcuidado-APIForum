import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Publicacao } from './publicacao.entity';


@Entity({ name: 'denuncia' })
export class Denuncia {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('integer')
    idUsuario!: number;

    @Column('varchar', { length: 100 })
    motivo!: string;

    @Column('varchar', { length: 500 })
    descricao!: string;

    @Column('timestamp')
    dataHora!: Date;

    @ManyToOne(() => Publicacao, (publicacao) => publicacao.denuncias)
    @JoinColumn()
    publicacao!: Publicacao;
}