import { Injectable } from '@nestjs/common';
import OpenAI, { AzureOpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';

const azureOpenAI = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_API_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: '2024-02-01',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

const GPT_MODEL = process.env.GPT_MODEL;

@Injectable()
export class OpenAiService {
  async complete(
    body: ChatCompletionCreateParamsNonStreaming,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return azureOpenAI.chat.completions.create({ ...body, model: GPT_MODEL });
  }

  async completeWithOpenAI(
    body: ChatCompletionCreateParamsNonStreaming,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return openai.chat.completions.create(body);
  }

  async batchComplete(jsonString: string): Promise<OpenAI.Batches.Batch> {
    // Write the JSON string to a temporary file
    const filePath = path.join('/tmp', `batch_${Date.now()}.json`);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(filePath);

    const openFile = await openai.files.create({ purpose: 'batch', file: fileStream });
    const batch = await openai.batches.create({
      input_file_id: openFile.id,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    });
    return batch;
  }

  async getBatch(batchId: string): Promise<OpenAI.Batches.Batch> {
    return openai.batches.retrieve(batchId);
  }

  async getBatchFile(fileId: string): Promise<string> {
    const fileResponse = await openai.files.content(fileId);
    const fileContents = await fileResponse.text();
    return fileContents;
  }
}
