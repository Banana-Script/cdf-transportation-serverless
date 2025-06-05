import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationIntegration } from '@app/database/entities/organizationIntegration.entity';
import { IntegrationParameter } from '@app/database/entities/integrationParameter.entity';

@Injectable()
export class GoogleService {
  constructor(
    @InjectRepository(OrganizationIntegration)
    private readonly orgIntegrationRepository: Repository<OrganizationIntegration>,
    @InjectRepository(IntegrationParameter)
    private readonly integrationParameterRepository: Repository<IntegrationParameter>,
  ) {}

  /**
   * Retrieves the Google access token for the given organization by querying the IntegrationParameter table.
   * @param organizationId The organization's ID.
   * @returns The stored Google access token.
   */
  async getAccessToken(organizationId: number): Promise<string> {
    console.log(
      '🤖 ~ google.service.ts:23 ~ GoogleService ~ getAccessToken ~ organizationId:',
      organizationId,
    );
    const integrationParam = await this.integrationParameterRepository
      .createQueryBuilder('param')
      .innerJoin('param.integration', 'integration')
      .where('integration.organizationId = :organizationId', { organizationId })
      .andWhere('param.name = :paramName', { paramName: 'google_access_token' })
      .getOne();

    if (!integrationParam || !integrationParam.value) {
      throw new HttpException('Google access token not found for organization', 404);
    }
    return integrationParam.value;
  }

  /**
   * Retrieves the Google refresh token for the given organization.
   * @param organizationId The organization's ID.
   * @returns The stored Google refresh token.
   */
  async getRefreshToken(organizationId: number): Promise<string> {
    const refreshParam = await this.integrationParameterRepository
      .createQueryBuilder('param')
      .innerJoin('param.integration', 'integration')
      .where('integration.organizationId = :organizationId', { organizationId })
      .andWhere('param.name = :paramName', { paramName: 'google_refresh_token' })
      .getOne();

    if (!refreshParam || !refreshParam.value) {
      throw new HttpException('Google refresh token not found for organization', 404);
    }
    return refreshParam.value;
  }

  /**
   * Refreshes the access token using the stored refresh token.
   * Updates the "google_access_token" parameter in the database.
   * @param organizationId The organization's ID.
   * @returns The new access token.
   */
  async refreshAccessToken(organizationId: number): Promise<string> {
    const refreshToken = await this.getRefreshToken(organizationId);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new HttpException('Google client credentials are missing', 500);
    }
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    try {
      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const tokenData = response.data;
      const newAccessToken = tokenData.access_token;
      if (!newAccessToken) {
        throw new HttpException('No new access token received on refresh', 400);
      }
      // Update the access token in the database.
      const integrationParam = await this.integrationParameterRepository
        .createQueryBuilder('param')
        .innerJoin('param.integration', 'integration')
        .where('integration.organizationId = :organizationId', { organizationId })
        .andWhere('param.name = :paramName', { paramName: 'google_access_token' })
        .getOne();
      if (integrationParam) {
        integrationParam.value = newAccessToken;
        await this.integrationParameterRepository.save(integrationParam);
      }
      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw new HttpException('Error refreshing access token', error.response?.status || 500);
    }
  }

  /**
   * Creates an event in the primary calendar of Google Calendar.
   * If the request returns 401 (unauthorized), it will attempt to refresh the token and retry once.
   * @param eventDetails The details of the event (summary, description, start, and end ISO strings).
   * @param organizationId The organization's ID.
   * @returns The created event object from Google Calendar.
   */
  async createEvent(
    eventDetails: {
      summary: string;
      description: string;
      start: string; // ISO string, e.g., '2025-02-28T14:00:00Z'
      end: string; // ISO string, e.g., '2025-02-28T15:00:00Z'
    },
    organizationId: number,
  ): Promise<any> {
    console.log('🤖 ~ google.service.ts:124 ~ GoogleService ~ eventDetails:', eventDetails);
    let accessToken = await this.getAccessToken(organizationId);
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const payload = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.start,
        timeZone: 'UTC', // Adjust as needed
      },
      end: {
        dateTime: eventDetails.end,
        timeZone: 'UTC', // Adjust as needed
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      // If unauthorized, refresh the token and retry once.
      if (error.response && error.response.status === 401) {
        accessToken = await this.refreshAccessToken(organizationId);
        try {
          const retryResponse = await axios.post(url, payload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error(
            'Error creating event after token refresh:',
            retryError.response?.data || retryError.message,
          );
          throw new HttpException(
            'Error creating event in Google Calendar after refreshing token',
            retryError.response?.status || 500,
          );
        }
      } else {
        console.error('Error creating event:', error.response?.data || error.message);
        throw new HttpException(
          'Error creating event in Google Calendar',
          error.response?.status || 500,
        );
      }
    }
  }
}
