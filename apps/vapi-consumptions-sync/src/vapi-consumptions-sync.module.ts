import { Module } from '@nestjs/common';
import { VapiConsumptionsSyncService } from './vapi-consumptions-sync.service';
import { DatabaseModule, ENTITIES } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VapiModule } from 'vapi/vapi';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([...ENTITIES]), VapiModule],
  controllers: [],
  providers: [VapiConsumptionsSyncService],
})
export class VapiConsumptionsSyncModule {}
