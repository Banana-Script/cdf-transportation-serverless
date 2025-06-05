import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './database/database-exception.filter';
import { resolve } from 'path';
import {
  BroadcastMessage,
  CampaignAudience,
  CampaignMessage,
  Conversation,
  DefinitionType,
  Organization,
  OrganizationCampaign,
  OrganizationFileUpload,
  OrganizationParameter,
  OrganizationProduct,
  OrganizationUser,
  ProductAttribute,
  SystemParameter,
  User,
  UserInsight,
  UserInsightDetail,
  UserSegment,
  ValueDefinition,
  ConversationMessage,
  ConversationSummary,
  OutboundCampaign,
  Lead,
  VarsLead,
  VarsOutboundCampaign,
  Call,
  PromoterScore,
  LeadCall,
} from './entities';
import { OrganizationTag } from './entities/organizationTags.entity';
import { OrganizationIntegration } from './entities/organizationIntegration.entity';
import { CampaignAudienceMessage } from './entities/campaignAudienceMessage.entity';
import { IntegrationParameter } from './entities/integrationParameter.entity';
import { ConversationTags } from './entities/conversationTags.entity';
import { ConversationAssigns } from './entities/conversationAssigns.entity';

export const ENTITIES = [
  BroadcastMessage,
  Conversation,
  DefinitionType,
  OrganizationParameter,
  User,
  ValueDefinition,
  UserSegment,
  Organization,
  OrganizationCampaign,
  CampaignAudience,
  CampaignMessage,
  OrganizationProduct,
  OrganizationTag,
  ConversationTags,
  ConversationAssigns,
  ProductAttribute,
  UserInsight,
  UserInsightDetail,
  OrganizationIntegration,
  CampaignAudienceMessage,
  IntegrationParameter,
  SystemParameter,
  OrganizationUser,
  OrganizationFileUpload,
  ConversationMessage,
  ConversationSummary,
  OutboundCampaign,
  Lead,
  VarsLead,
  VarsOutboundCampaign,
  Call,
  PromoterScore,
  LeadCall,
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timezone: '+00:00', //UTC
      multipleStatements: true,
      entities: ENTITIES,
      synchronize: false,
      migrations: [resolve(__dirname, '../migrations/*.ts')],
      namingStrategy: new SnakeNamingStrategy(),
      logging: ['error'],
      extra: {
        connectionLimit: 2,
      },
      subscribers: [],
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [
    DatabaseService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
