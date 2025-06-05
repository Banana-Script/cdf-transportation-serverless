import { Module } from '@nestjs/common';
import { DialogMinerService } from './dialog-miner.service';
import { OpenAiModule } from 'OpenAI/open-ai';

@Module({
  imports: [OpenAiModule],
  providers: [DialogMinerService],
  exports: [DialogMinerService],
})
export class DialogMinerModule {}
