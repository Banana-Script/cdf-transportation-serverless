import { DatabaseService } from '@app/database';
import { Organization } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SQSEvent } from 'aws-lambda';
import { Repository } from 'typeorm';
import { VapiService } from 'vapi/vapi';
import { Vapi } from '@vapi-ai/server-sdk';

@Injectable()
export class VapiConsumptionsSyncService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    public vapiService: VapiService,
    public dbService: DatabaseService,
  ) {}

  async handleConsumptionsUpdateFromAnalytics(event: SQSEvent): Promise<string> {
    try {
      const organizations: Organization[] = await this.organizationRepository
        .createQueryBuilder('o')
        .where('o.subscription_cuttoff_date IS NOT NULL')
        .andWhere('o.total_minutes_per_month > 0')
        .getMany();

      if (organizations.length === 0) return 'Organizations not found.';

      for (const organization of organizations) {
        console.log(`📌 - Consumption sync for organization ${organization.name}`);

        // Get the VAPI token parameter
        const vapi_token = await this.dbService.getOrganizationParameter(
          organization.id,
          'vapi_token',
        );

        if (!vapi_token) continue;

        // Always use subscriptionCuttoffDate as the start date for analytics
        const start_date = new Date(organization.subscriptionCuttoffDate.toISOString());
        start_date.setHours(0, 0, 0, 0); // Sets hours, minutes, seconds, milliseconds to beginning of day

        console.log(
          '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - start_date:',
          start_date,
        );

        const queryDto: Vapi.AnalyticsQueryDto = {
          queries: [
            {
              table: 'call',
              name: 'name',
              operations: [
                {
                  operation: 'sum',
                  column: 'duration',
                },
              ],
              timeRange: {
                start: start_date.toISOString(),
              },
            },
          ],
        };

        const analyticsResult: Vapi.AnalyticsQueryResult[] = await this.vapiService.getAnalytics(
          vapi_token.value,
          queryDto,
        );

        console.log(
          '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - number of results:',
          analyticsResult.length,
        );

        let totalConsumedMinutes = 0.0;
        let latestUpdateDate = new Date();

        try {
          if (analyticsResult.length > 0 && analyticsResult[0].result.length > 0) {
            latestUpdateDate = new Date(analyticsResult[0].timeRange.end);
            totalConsumedMinutes = parseFloat(String(analyticsResult[0].result[0]['sumDuration']));
          }
        } catch (error) {
          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - error:',
            error,
          );
        }

        console.log(
          '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - totalConsumedMinutes:',
          totalConsumedMinutes,
        );

        if (totalConsumedMinutes > 0) {
          // Get the latest organization data
          const update_organization = await this.organizationRepository.findOne({
            where: { id: organization.id },
          });

          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - totalMinutesPerMonth:',
            update_organization.totalMinutesPerMonth,
          );
          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - totalMinutesRecharged:',
            update_organization.totalMinutesRecharged,
          );

          // Calculate current consumed minutes and recharged minutes
          let currentConsumedMinutes = 0.0;
          let currentRechargedConsumedMinutes = 0.0;

          if (totalConsumedMinutes > update_organization.totalMinutesPerMonth) {
            // If consumption exceeds monthly limit, cap currentMinutesCount at totalMinutesPerMonth
            // and put the excess into currentMinutesRecharged
            currentConsumedMinutes = update_organization.totalMinutesPerMonth;
            currentRechargedConsumedMinutes =
              totalConsumedMinutes - update_organization.totalMinutesPerMonth;
          } else {
            // Otherwise, all consumed minutes go to currentMinutesCount
            currentConsumedMinutes = totalConsumedMinutes;
            currentRechargedConsumedMinutes = 0;
          }

          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - totalConsumedMinutes:',
            totalConsumedMinutes,
          );
          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - currentConsumedMinutes:',
            currentConsumedMinutes,
          );
          console.log(
            '📌 - vapi-consumptions-sync.service.ts - VapiConsumptionsSyncService - handleConsumptionsUpdateFromAnalytics - currentRechargedConsumedMinutes:',
            currentRechargedConsumedMinutes,
          );

          // Update the organization with the calculated minutes
          await this.organizationRepository.update(update_organization.id, {
            ...update_organization,
            currentMinutesCount: this.roundToTwoDecimals(currentConsumedMinutes), // consumed minutes
            currentMinutesRecharged: this.roundToTwoDecimals(currentRechargedConsumedMinutes), // consumed recharged minutes
            lastConsumptionsUpdate: new Date(latestUpdateDate.toISOString()),
            updatedAt: new Date(),
          });

          console.log(`📌 - Consumption sync for organization ${organization.name} UPDATED`);
        } else {
          console.log(`📌 - Consumption sync for organization ${organization.name} NOT UPDATED`);
        }

        await this.delay(2000); // Pause execution for 2000 milliseconds (2 seconds)
      }
    } catch (err) {
      console.error('📌 - Failed to sync organization consumptions:', err);
    }

    return event.Records[0].body;
  }

  async handleConsumptionsUpdateFromCallsLog(event: SQSEvent): Promise<string> {
    try {
      const organizations: Organization[] = await this.organizationRepository
        .createQueryBuilder('o')
        .where('o.subscription_cuttoff_date IS NOT NULL')
        .andWhere('o.total_minutes_per_month > 0')
        .getMany();

      if (organizations.length === 0) return 'Organizations not found.';

      for (const organization of organizations) {
        console.log(`📌 - Consumption sync for organization ${organization.name}`);
        // Get the parameter for calculate the maximum elapsed time to create a new conversation
        const vapi_token = await this.dbService.getOrganizationParameter(
          organization.id,
          'vapi_token',
        );

        if (!vapi_token) continue;

        let first_update = true;
        let last_update_date = new Date(organization.subscriptionCuttoffDate.toISOString());
        // 1. Subtract one day
        // setDate handles month/year rollovers automatically
        last_update_date.setDate(last_update_date.getDate() - 1);

        // 2. Set time to 23:59:59.999 (end of the second)
        last_update_date.setHours(23, 59, 59, 999); // Sets hours, minutes, seconds, milliseconds

        if (organization?.lastConsumptionsUpdate) {
          first_update = false;
          last_update_date = new Date(organization.lastConsumptionsUpdate.toISOString());
        }

        console.log(
          '📌 - vapi-consumptions-sync.service.ts:200 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - last_update_date:',
          last_update_date,
        );

        const vapiCalls: Vapi.Call[] = await this.vapiService.getCallsList(
          vapi_token.value,
          last_update_date.toISOString(),
        );
        console.log(
          '📌 - vapi-consumptions-sync.service.ts:209 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - number of calls:',
          vapiCalls.length,
        );

        if (vapiCalls.length > 0) {
          const durationSeconds = this.getAllDurations(vapiCalls);

          if (durationSeconds.length > 0) {
            const totalDurationSeconds = durationSeconds.reduce((acc, curr) => acc + curr, 0);

            if (totalDurationSeconds > 0) {
              const latestUpdateDate = this.getMaxUpdatedAtLoop(vapiCalls) || new Date();

              if (first_update) {
                await this.organizationRepository.update(organization.id, {
                  ...organization,
                  currentMinutesCount: 0, // consumed minutes
                  currentMinutesRecharged: 0, // consumed recharged minutes
                });
              }

              const update_organization = await this.organizationRepository.findOne({
                where: { id: organization.id },
              });

              console.log(
                '📌 - vapi-consumptions-sync.service.ts:235 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - totalMinutesPerMonth:',
                update_organization.totalMinutesPerMonth,
              );
              console.log(
                '📌 - vapi-consumptions-sync.service.ts:239 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - totalMinutesRecharged:',
                update_organization.totalMinutesRecharged,
              );

              const totalConsumedMinutes = totalDurationSeconds / 60; // seconds to minutes
              let currentConsumedMinutes = 0.0;
              let currentRechargedConsumedMinutes = 0.0;
              // if (
              //   (update_organization?.currentMinutesCount || 0.0) + totalConsumedMinutes >
              //   update_organization.totalMinutesPerMonth
              // ) {
              //   currentConsumedMinutes = update_organization.totalMinutesPerMonth;
              //   currentRechargedConsumedMinutes =
              //     (update_organization?.currentMinutesRecharged || 0.0) +
              //     ((update_organization?.currentMinutesCount || 0.0) +
              //       totalConsumedMinutes -
              //       update_organization.totalMinutesPerMonth);
              // } else {
              //   currentConsumedMinutes =
              //     (update_organization?.currentMinutesCount || 0.0) + totalConsumedMinutes;
              // }

              if (totalConsumedMinutes > update_organization.totalMinutesPerMonth) {
                currentConsumedMinutes = update_organization.totalMinutesPerMonth;
                currentRechargedConsumedMinutes =
                  totalConsumedMinutes - update_organization.totalMinutesPerMonth;
              } else {
                currentConsumedMinutes = totalConsumedMinutes;
              }

              console.log(
                '📌 - vapi-consumptions-sync.service.ts:261 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - totalConsumedMinutes:',
                totalConsumedMinutes,
              );
              console.log(
                '📌 - vapi-consumptions-sync.service.ts:265 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - currentConsumedMinutes:',
                currentConsumedMinutes,
              );
              console.log(
                '📌 - vapi-consumptions-sync.service.ts:269 - VapiConsumptionsSyncService - handleConsumptionsUpdateFromCallsLog - currentRechargedConsumedMinutes:',
                currentRechargedConsumedMinutes,
              );

              await this.organizationRepository.update(update_organization.id, {
                ...update_organization,
                currentMinutesCount: this.roundToTwoDecimals(currentConsumedMinutes), // consumed minutes
                currentMinutesRecharged: this.roundToTwoDecimals(currentRechargedConsumedMinutes), // consumed recharged minutes
                lastConsumptionsUpdate: new Date(latestUpdateDate.toISOString()),
                updatedAt: new Date(),
              });
            }
          }
          console.log(`📌 - Consumption sync for organization ${organization.name} UPDATED`);
        } else {
          console.log(`📌 - Consumption sync for organization ${organization.name} DO NOT UPDATED`);
        }

        await this.delay(2000); // Pause execution for 2000 milliseconds (2 seconds)
      }
    } catch (err) {
      console.error('📌 - Failed to sync organization consumptions:', err);
    }

    return event.Records[0].body;
  }

  /**
   * @param ms Delay milliseconds
   * @returns None
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extracts all duration values from the messages array within a list of Calls.
   * @param records - An array of Call objects.
   * @returns An array of numbers representing all found durations.
   */
  private getAllDurations(records: Vapi.Call[]): number[] {
    return (
      records
        // Step 1: Get all 'messages' arrays and flatten them into a single array of messages.
        // Use nullish coalescing (??) to provide an empty array if 'messages' is missing.
        .flatMap((record) => record.messages ?? [])
        // Step 2: Map each message object to its 'duration' property.
        // This will result in an array containing numbers and potentially undefined values.
        .map((message: any) => message?.duration / 1000 || 0)
        // Step 3: Filter the array to keep only the elements that are numbers.
        // The type predicate `duration is number` helps TypeScript understand the resulting array type.
        .filter((duration): duration is number => typeof duration === 'number')
    );
  }

  private getMaxUpdatedAtLoop(records: Vapi.Call[]): Date | null {
    if (!records || records.length === 0) {
      return null;
    }

    let maxDate: Date | null = null;

    for (const record of records) {
      // Check if updatedAt exists and is a non-empty string
      if (typeof record.updatedAt !== 'string' || record.updatedAt === '') {
        continue; // Skip this record
      }

      const currentDate = new Date(record.updatedAt);

      // Check if the parsed date is valid
      if (isNaN(currentDate.getTime())) {
        continue; // Skip invalid dates
      }

      // Compare with the current maximum
      if (maxDate === null || currentDate.getTime() > maxDate.getTime()) {
        maxDate = currentDate; // Update the max
      }
    }

    return maxDate;
  }

  private roundToTwoDecimals(num: number): number {
    // Use toFixed to handle rounding and ensure 2 decimal places in the string
    const fixedString = num.toFixed(2);
    // Parse the string back to a float number
    return parseFloat(fixedString);
  }
}
