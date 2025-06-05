import { Module } from '@nestjs/common';
import { VapiService } from './vapi.service';
import { DatabaseModule, ENTITIES } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([...ENTITIES])],
  providers: [VapiService],
  exports: [VapiService],
})
export class VapiModule {}
