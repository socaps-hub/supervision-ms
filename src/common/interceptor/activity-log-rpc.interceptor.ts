import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { AuditSourceEnum } from '../enums/audit-source.enum';
import { ActivityLogMetadata, ACTIVITY_LOG_KEY } from '../decorators/activity-log.decorator';
import { AuditResultEnum } from '../enums/audit-result.enum';
import { NATS_SERVICE } from 'src/config';
import { ActivityLogEvent } from '../entities/activity-log-event.interface';

@Injectable()
export class ActivityLogRpcInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<ActivityLogMetadata>(
      ACTIVITY_LOG_KEY,
      context.getHandler(),
    );

    if (!meta) {
      return next.handle();
    }

    const rpcCtx = context.switchToRpc();
    const payload = rpcCtx.getData();

    const user = payload?.user;
    const input = payload?.input ?? payload;
    const metaContext = payload?.meta;

    return next.handle().pipe(
      tap((response) => {
        this.emitEvents(meta, input, user, response, AuditResultEnum.SUCCESS, undefined, metaContext);
      }),
      catchError((error) => {
        this.emitEvents(meta, input, user, undefined, AuditResultEnum.FAILED, error, metaContext);
        throw error;
      }),
    );
  }

  private emitEvents(
    meta: ActivityLogMetadata,
    input: any,
    user: any,
    response: any,
    result: AuditResultEnum,
    error?: any,
    metaContext?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
      correlationId?: string;
    },
  ) {
    for (const e of meta.entities) {
      const rawId = this.resolvePath(response ?? input, e.idPath);

      const entityIds = Array.isArray(rawId) ? rawId : [rawId];

      for (const entityId of entityIds) {
        if (!entityId) continue;
        
        const event: ActivityLogEvent = {
          service: meta.service,
          module: meta.module,
          action: meta.action,
          source: meta.source ?? AuditSourceEnum.API,
          result,
          eventName: meta.eventName,
  
          entity: e.name,
          entityId,
  
          user: {
            id: user?.R12Id,
            nombre: user?.R12Nom,
            rol: user?.R12Rol,
          },
  
          org: {
            cooperativaId: user?.R12Coop_id,
            sucursalId: user?.R12Suc_id,
          },
  
          before: input,
          after: result === AuditResultEnum.SUCCESS ? response : undefined,
  
          meta: {
            ip: metaContext?.ip,
            userAgent: metaContext?.userAgent,
            requestId: metaContext?.requestId,
            correlationId: metaContext?.correlationId,
          },
  
          message: error?.message,
          error: error ? JSON.stringify(error) : undefined,
        };
  
        this.natsClient.emit('activity.log.created', event);
      }

    }
  }

  private resolvePath(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }
}


