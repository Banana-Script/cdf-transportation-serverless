import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { DatabaseModule, ENTITIES } from '@app/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([...ENTITIES])],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
