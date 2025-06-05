import { Injectable } from '@nestjs/common';
import { OrganizationParameter, UserInsight, UserInsightDetail, ValueDefinition } from './entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(ValueDefinition)
    private valueDefinitionRepository: Repository<ValueDefinition>,
    @InjectRepository(OrganizationParameter)
    private organizationParameterRepository: Repository<OrganizationParameter>,
    @InjectRepository(UserInsight)
    private userInsightRepository: Repository<UserInsight>,
    @InjectRepository(UserInsightDetail)
    private userInsightDetailRepository: Repository<UserInsightDetail>,
  ) {}

  getValueDefinitionId = async (
    definitionType: string,
    valueDefinition: string,
  ): Promise<ValueDefinition> => {
    return new Promise(async (resolve, reject) => {
      try {
        const value = this.valueDefinitionRepository
          .createQueryBuilder('valueDefinitions')
          .innerJoinAndSelect('valueDefinitions.definitionType', 'definitionType')
          .where('definitionType.definition_type = :definition_type', {
            definition_type: definitionType,
          })
          .andWhere('valueDefinitions.value_definition = :value_definition', {
            value_definition: valueDefinition,
          });
        const status = await value.getOneOrFail();
        resolve(status);
      } catch (error) {
        reject(error);
      }
    });
  };

  getOrganizationParameter = async (
    organizationId: number,
    parameterName: string,
  ): Promise<OrganizationParameter> => {
    return new Promise(async (resolve, reject) => {
      try {
        const value = this.organizationParameterRepository
          .createQueryBuilder('op')
          .where('op.organization_id = :organizationId', {
            organizationId: organizationId,
          })
          .andWhere('op.name = :parameterName', {
            parameterName: parameterName,
          });
        const parameter = await value.getOneOrFail();
        resolve(parameter);
      } catch (error) {
        reject(error);
      }
    });
  };

  async buildUserSummaryPrompt(userId: number, organizationId: number): Promise<string | null> {
    const insight = await this.userInsightRepository.findOne({
      where: { user: { id: userId }, organization: { id: organizationId } },
      order: { id: 'DESC' },
    });

    if (!insight) {
      return null;
    }

    const details = await this.userInsightDetailRepository.find({
      where: { userInsight: insight },
      order: { id: 'DESC' },
    });

    const findFeature = (feature: string) => details.find((detail) => detail.feature === feature);

    const summary_profile = findFeature('summary_profile');
    const collection_of_information = findFeature('collection_of_information');
    const other_topics = findFeature('other_topics');
    const last_interactions_reason = findFeature('last_interactions_reason');

    const userSummary = {
      summary_profile: summary_profile?.value,
      collection_of_information: collection_of_information?.value,
      other_topics: other_topics?.value,
      last_interactions_reason: last_interactions_reason?.value,
    };

    // Build the prompt for user's summary. The AI agent should use this summary to:
    const userSummaryPrompt = `
      User Summary:
      - Profile: ${userSummary.summary_profile}
      - Information Collection: ${userSummary.collection_of_information}
      - Other Topics: ${userSummary.other_topics}
      - Last Interaction Reason: ${userSummary.last_interactions_reason}
      
      Instructions for AI Agent:
      1. Use the provided user summary to understand the user's context and preferences.
      2. Avoid asking the user for the same information again.
      3. Provide personalized responses based on the user's profile and past interactions.
      4. Address the user's needs efficiently by leveraging the provided information.
      
      Please follow these instructions strictly to ensure a personalized and efficient service experience for the user.
      `;

    return userSummaryPrompt;
  }
}
