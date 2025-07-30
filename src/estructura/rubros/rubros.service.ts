import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CreateRubroInput } from './dto/create-rubro.input';
import { UpdateRubroInput } from './dto/update-rubro.input';
import { Rubro } from './entities/rubro.entity';
import { RpcException } from '@nestjs/microservices';
import { CreateManyRubrosFromExcelDto } from './dto/create-many-rubros-from-excel.dto';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';

@Injectable()
export class RubrosService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('RubrosService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(input: CreateRubroInput): Promise<Rubro> {
    const { R03G_id, R03Nom } = input;

    // Validar que no exista otro rubro con el mismo nombre en el mismo grupo
    const existing = await this.r03Rubro.findFirst({
      where: {
        R03Nom: R03Nom.trim(),
        R03G_id,
      }
    });

    if (existing) {
      throw new RpcException({
        message: `Ya existe el rubro ${R03Nom.trim()} en este grupo`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const rubro = await this.r03Rubro.create({
      data: {
        R03G_id,
        R03Nom,
      }
    });

    return rubro;
  }

  async createManyFromExcel(
    data: CreateManyRubrosFromExcelDto[],
    coopId: string,
  ): Promise<BooleanResponse> {
    const rubrosToCreate: any[] = [];

    try {
      for (const item of data) {
        const nombre = item.Nombre?.trim();
        const grupoNombre = item.Grupo?.trim();

        if (!nombre || !grupoNombre) continue;

        // Buscar grupo por nombre (case-insensitive)
        const grupo = await this.r02Grupo.findFirst({
          where: {
            R02Coop_id: coopId,
            R02Nom: {
              equals: grupoNombre,
              mode: 'insensitive',
            },
          },
        });

        if (!grupo) continue;

        // Verificar si ya existe el rubro en ese grupo
        const rubroExistente = await this.r03Rubro.findFirst({
          where: {
            R03G_id: grupo.R02Id,
            R03Nom: {
              equals: nombre,
              mode: 'insensitive',
            },
          },
        });

        if (rubroExistente) continue;

        rubrosToCreate.push({
          R03Nom: nombre,
          R03G_id: grupo.R02Id,
        });
      }

      if (!rubrosToCreate.length) {
        return {
          success: false,
          message:
            'No se encontraron rubros nuevos para agregar. Verifica que los grupos existan y que los rubros no estén duplicados.',
        };
      }

      const result = await this.r03Rubro.createMany({
        data: rubrosToCreate,
        skipDuplicates: true,
      });

      return {
        success: true,
        message: `${result.count} rubros creados exitosamente.`,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Error en la importación de rubros.',
      };
    }
  }

  async findAll(coopId: string): Promise<Rubro[]> {
    return this.r03Rubro.findMany({
      // orderBy: {
      //   R03Creado_en: 'desc'
      // },
      where: {
        grupo: {
          R02Coop_id: coopId, // Asegúrate que el grupo tiene esta relación en Prisma
        }
      },
      include: {
        grupo: true,
        elementos: true,
      }
    });
  }

  async findById(id: string): Promise<Rubro> {
    const rubro = await this.r03Rubro.findFirst({
      where: { R03Id: id },
      include: { grupo: true, elementos: true },
    });

    if (!rubro) {
      throw new RpcException({
        message: `Rubro con id ${id} no existe`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return rubro;
  }

  async update(id: string, updateRubroInput: UpdateRubroInput): Promise<Rubro> {
    const rubroDB = await this.findById( id );

    const { R03G_id, R03Nom } = updateRubroInput

    if ( R03Nom ) {
      // Validar duplicado por nombre en el mismo grupo, excluyendo el rubro actual
      const rubro = await this.r03Rubro.findFirst({
        where: {
          R03G_id,
          R03Nom: R03Nom.trim(),
          NOT: {
            R03Id: id,
          }
        }
      })

      if ( rubro && rubro.R03Id !== id ) {
        throw new RpcException({
          message: `Ya existe un rubro con el nombre ${R03Nom} en el mismo grupo`,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }


    return this.r03Rubro.update({
      where: { R03Id: id },
      data: {
        R03Nom: updateRubroInput.R03Nom,
        R03G_id: updateRubroInput.R03G_id,
      }
    });
  }

  async remove(id: string): Promise<Rubro> {
    await this.findById( id );

    return this.r03Rubro.delete({ where: { R03Id: id } });
  }
}
