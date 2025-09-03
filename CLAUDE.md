# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS serverless monorepo containing AWS Lambda microservices for conversational AI, CDF transportation systems, Cognito authentication, VAPI integrations, and messaging services. The project uses TypeORM with MySQL, AWS Lambda deployment via Serverless Framework, and integrates with multiple third-party services including Twilio, WhatsApp, OpenAI, and Google services.

## Key Commands

### Development
- `npm run start` - Start all services locally via serverless offline (http://localhost:3000)
- `npm run serverless:start` - Build and start serverless offline environment
- `npm run serverless:run` - Start serverless offline on port 3500
- `npm run serverless:runts` - Start using local TypeScript configuration
- `npm run build` - Build all applications using build.sh script
- `npm run build:multi` - Multi-build script for all apps
- `nest build <app-name> --webpack` - Build specific application

### Testing and Code Quality
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode  
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - ESLint with auto-fix for TypeScript files
- `npm run format` - Prettier formatting for apps and libs
- `npm run pretty` - Format all TypeScript/JavaScript files

### Database Management
- `npm run migrations:run` - Run TypeORM migrations and seeds
- `npm run migrations:generate` - Generate new migration
- `npm run migrations:create` - Create empty migration
- `npm run migrations:show` - Show migration status
- `npm run migrations:revert` - Revert last migration
- `npm run seed:run` - Run database seeding
- `npm run schema:drop` - Drop database schema
- `npm run schema:sync` - Sync database schema

### Local Function Testing
- `serverless invoke local -f <function-name> -p <event-file> --stage local`
- Examples:
  - `nest build users && serverless invoke local -f users -p ./apps/users/event.json --stage local`
  - `nest build custom-sms-sender && serverless invoke local -f custom-sms-sender -p ./apps/custom-sms-sender/event.json --stage local`
- **Important**: Always use `--stage local` to enable serverless-offline-ssm plugin for local SSM parameter simulation

## Architecture

### Monorepo Structure
- **apps/**: Lambda function applications (users, cognito-messages, custom-sms-sender, vapi-consumptions-sync)
- **libs/**: Shared libraries (database, auth, notifications, open-ai, whatsapp, vapi, twilio, google, dialog-miner)
- **events/**: Test event files for local function invocation
- **dist/**: Compiled output for serverless deployment

### Applications
- **users**: User management microservice
- **cognito-messages**: AWS Cognito message handling
- **custom-sms-sender**: Custom SMS sending Lambda for Cognito
- **vapi-consumptions-sync**: VAPI usage synchronization service

### Shared Libraries
- **database**: TypeORM configuration, entities, and database service with MySQL connection
- **auth**: JWT authentication, Cognito integration, and authorization guards
- **notifications**: Notification service for various channels
- **open-ai**: OpenAI API integration and language model services
- **whatsapp**: WhatsApp Business API integration
- **vapi**: VAPI (Voice API) service integration
- **twilio**: Twilio SMS/Voice services
- **google**: Google services integration
- **dialog-miner**: Conversation analysis and mining

### Database Entities
Key entities include: Organization, User, Conversation, Campaign, Lead, Call, OutboundCampaign, VarsLead, PromoterScore, and various relationship/configuration entities.

### Import Paths
TypeScript path mapping is configured for:
- `@app/database` → libs/database/src
- `@auth/auth` → libs/auth/src
- `@notifications/notifications` → libs/notifications/src
- `OpenAI/open-ai` → libs/open-ai/src
- `@app/whatsapp` → libs/whatsapp/src
- `vapi/vapi` → libs/vapi/src
- `@app/twilio` → libs/twilio/src
- `@app/google` → libs/google/src
- `miner/dialog-miner` → libs/dialog-miner/src

## Environment Configuration

### Required Environment Variables
- Database: `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`, `DB_DIALECT`
- AWS: `REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `FILES_BUCKET`, `APP_DOMAIN`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_SMS_NUMBER`
- Environment: `ENV`, `PARAMS_ENV` (must be set to `dev` for local development)

### Configuration Sources
- Local development uses `serverless-offline-ssm` plugin with local SSM parameter simulation
- Production uses AWS SSM Parameter Store for secrets management
- Environment variables are mapped through serverless.yml custom secrets section
- **Important**: Set `PARAMS_ENV=dev` in `.env` file for local testing to resolve SSM parameters correctly

## Deployment

### Serverless Framework
- Uses Serverless Framework v4 with AWS provider
- Runtime: Node.js 22.x
- Individual packaging for each Lambda function
- Lambda Insights enabled for monitoring
- VPC configuration with security groups and subnets
- KMS key management for Cognito SMS encryption

### Build Process
The `build.sh` script automatically builds all applications in the apps directory using NestJS with webpack optimization.

## Development Workflow

### Adding New Microservice
1. Create new app: `nest generate app <app-name>`
2. Configure in `nest-cli.json` projects section
3. Add serverless function configuration in `serverless.yml`
4. Create event.json file for local testing
5. Update build scripts if needed

### Adding New Library
1. Create new lib: `nest generate library <lib-name>`
2. Configure TypeScript path mapping in `tsconfig.json`
3. Add Jest module mapping in `package.json`
4. Export from library's index.ts

### Database Changes
1. Create entity in `libs/database/src/entities/`
2. Export entity from `entities/index.ts`
3. Add to ENTITIES array in `database.module.ts`
4. Generate migration: `npm run migrations:generate -- <migration-name>`
5. Run migration: `npm run migrations:run`

## Technology Stack
- **Runtime**: Node.js 22.x
- **Framework**: NestJS with Express adapter
- **Database**: MySQL with TypeORM
- **Authentication**: AWS Cognito + JWT
- **Deployment**: AWS Lambda via Serverless Framework
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **AI/ML**: OpenAI, LangChain, AssemblyAI
- **Communication**: Twilio, WhatsApp Business API, VAPI
- **Cloud Services**: AWS (Lambda, S3, SQS, EventBridge, KMS)