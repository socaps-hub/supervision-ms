import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { CreateElementoInput } from './dto/create-elemento.input';
import { UpdateElementoInput } from './dto/update-elemento.input';
import { Elemento } from './entities/elemento.entity';

@Injectable()
export class ElementosService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ElementosService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createElementoInput: CreateElementoInput): Promise<Elemento> {
    const { R04Nom, R04Imp, R04R_id } = createElementoInput;

    const elemento = await this.r04Elemento.findFirst({
      where: { R04Nom, R04R_id }
    });

    if (elemento) {
      throw new RpcException({
        message: `Elemento ${R04Nom} ya existe en este rubro`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.r04Elemento.create({
      data: {
        R04Nom,
        R04Imp,
        R04R_id,
      }
    });
  }

  async findAll(rubroId: string): Promise<Elemento[]> {
    return this.r04Elemento.findMany({
      where: { R04R_id: rubroId },
      include: { rubro: true }
    });
  }

  async findById(id: string): Promise<Elemento> {
    const elemento = await this.r04Elemento.findFirst({
      where: { R04Id: id },
      include: { rubro: true }
    });

    if (!elemento) {
      throw new RpcException({
        message: `Elemento con ID ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return elemento;
  }

  async update(id: string, updateElementoInput: UpdateElementoInput): Promise<Elemento> {
    const { R04Nom, R04Imp, R04R_id } = updateElementoInput;

    const elementoDB = await this.findById(id);
    if (!elementoDB) {
      throw new RpcException({
        message: `Elemento con ID ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    if ( R04Nom ) {
      const duplicado = await this.r04Elemento.findFirst({
        where: {
          R04R_id,
          R04Nom: R04Nom.trim(),
          NOT: { R04Id: id }
        }
      });

      if ( duplicado && duplicado.R04Id !== id ) {
        // Si existe otro elemento con el mismo nombre en el mismo rubro
  
        if (duplicado) {
          throw new RpcException({
            message: `Ya existe un elemento con el nombre ${R04Nom} en este rubro`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }
    }

    return this.r04Elemento.update({
      where: { R04Id: id },
      data: {
        R04Nom,
        R04Imp,
        R04R_id
      }
    });
  }

  async remove(id: string): Promise<Elemento> {
    const elemento = await this.findById(id)

    if (!elemento) {
      throw new RpcException({
        message: `Elemento con ID ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r04Elemento.delete({ where: { R04Id: id } });
  }
}
