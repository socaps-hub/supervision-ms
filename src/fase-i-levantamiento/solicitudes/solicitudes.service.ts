import { Injectable, Logger, HttpStatus, OnModuleInit, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { PrismaClient, R01Prestamo } from '@prisma/client';

import { CreatePrestamoInput } from './dto/create-solicitud.input';
import { UpdatePrestamoInput } from './dto/update-solicitud.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class SolicitudesService extends PrismaClient implements OnModuleInit {
  private readonly _logger = new Logger('SolicitudesService');

  // constructor(
  //   @Inject(NATS_SERVICE) private readonly _client: ClientProxy,
  // ) {
  //   super();
  // }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(data: CreatePrestamoInput, user: Usuario): Promise<R01Prestamo> {

    const exists = await this.r01Prestamo.findUnique({
      where: { R01NUM: data.R01NUM, R01Coop_id: user.R12Coop_id },
      include: {
        sucursal: true
      }
    });

    if (exists) {
      const sucursal = exists.sucursal.R11Nom
      const socio = exists.R01Nom
      const cag = exists.R01Nso
      const message = `El préstamo con número ${data.R01NUM} ya existe en ${ sucursal } a nombre de ${ socio } con CAG ${ cag }`
      throw new RpcException({
        message,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.r01Prestamo.create({
      data,
      include: {
        sucursal: true
      }
    });
  }

  async findAll( user: Usuario ): Promise<R01Prestamo[]> {
    return await this.r01Prestamo.findMany({
      where: { R01Activ: true, R01Suc_id: user.R12Suc_id, R01Coop_id: user.R12Coop_id },
      include: {
        categoria: true,
        producto: true,
        sucursal: true,
        supervisor: true,
        ejecutivo: true,
        evaluacionesF1: true,
        resumenF1: true,
      },
    });
  }

  async findById(id: string, user: Usuario): Promise<R01Prestamo> {
    const prestamo = await this.r01Prestamo.findUnique({
      where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
      include: {
        categoria: true,
        producto: true,
        sucursal: true,
        supervisor: true,
        ejecutivo: true,
      },
    });

    if (!prestamo) {
      throw new RpcException({
        message: `Préstamo con número ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return prestamo;
  }

  async update(id: string, data: UpdatePrestamoInput, user: Usuario): Promise<R01Prestamo> {
    const exists = await this.findById(id, user)
    

    if (!exists) {
      throw new RpcException({
        message: `No se puede actualizar. Préstamo con número ${id} no existe`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const { id: R01NUM, ...rest } = data

    return await this.r01Prestamo.update({
      where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
      data: {
        R01NUM,
        ...rest,
      },
    });
  }

  async remove(id: string, user: Usuario): Promise<R01Prestamo> {
    const exists = await this.findById(id, user)

    if (!exists) {
      throw new RpcException({
        message: `No se puede eliminar. Préstamo con número ${id} no existe`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r01Prestamo.update({
      where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
      data: {
        R01Activ: false,
      },
    });
  }
}
