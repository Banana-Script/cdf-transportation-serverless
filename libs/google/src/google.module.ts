import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { DatabaseModule, ENTITIES } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([...ENTITIES])],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}
