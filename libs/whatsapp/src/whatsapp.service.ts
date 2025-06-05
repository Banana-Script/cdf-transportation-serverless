import { DatabaseService } from '@app/database';
import { ValueDefinition } from '@app/database/entities';
import { OrganizationIntegration } from '@app/database/entities/organizationIntegration.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import { Repository } from 'typeorm';
const BASE_URL = 'https://graph.facebook.com/v20.0';

type IntegrationParameters = {
  phone_number: string;
  phone_number_id: string;
  token: string;
  business_id: string;
};

@Injectable()
export class WhatsappService {
  constructor(
    @InjectRepository(OrganizationIntegration)
    private readonly organizationIntegrationRepository: Repository<OrganizationIntegration>,
    public dbService: DatabaseService,
  ) {}

  public async sendMessageUsingWhatsApp(
    organizationId: number,
    phoneNumber: string,
    messageText: string,
  ): Promise<boolean> {
    try {
      const { phone_number_id, token } = await this.findIntegrationParameters(organizationId);
      console.log(`${BASE_URL}/${phone_number_id}/messages`);
      const response = await axios.post(
        `${BASE_URL}/${phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('WhatsApp message response:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  public async sendTemplateMessageUsingWhatsApp(
    organizationId: number,
    phoneNumber: string,
    templateName: string,
    templateData: any = null,
  ): Promise<boolean> {
    try {
      const { phone_number_id, token } = await this.findIntegrationParameters(organizationId);
      let components = {};
      if (templateData !== null && Object.keys(templateData).length > 0) {
        const parameters = [];
        for (const key in templateData) {
          parameters.push({
            type: 'text',
            text: templateData[key].toString(),
          });
        }

        if (parameters.length > 0) {
          components = {
            components: [
              {
                type: 'body',
                parameters: [...parameters],
              },
            ],
          };
        }
      }

      const response = await axios.post(
        `${BASE_URL}/${phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es',
            },
            ...components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('WhatsApp message response:', response.data);
      return true;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.log('🚀 ~ WhatsappService ~ error response:', JSON.stringify(error.response.data));
        throw new Error('Failed to send WhatsApp message : ' + error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.log('🚀 ~ WhatsappService ~ error request:', JSON.stringify(error.message));
        throw new Error('Failed to send WhatsApp message : ' + error.request);
      } else {
        // Something happened in setting up the request that triggered an error
        console.log('🚀 ~ WhatsappService ~ error message:', JSON.stringify(error.message));
        throw new Error('Failed to send WhatsApp message : ' + error.message);
      }
    }
  }

  public async sendMediaTemplateMessageUsingWhatsApp(
    organizationId: number,
    phoneNumber: string,
    templateName: string,
    mediaId: string,
    templateData: any = null,
  ): Promise<boolean> {
    try {
      const { phone_number_id, token } = await this.findIntegrationParameters(organizationId);
      const components = [];
      if (templateData !== null && Object.keys(templateData).length > 0) {
        const parameters = [];
        for (const key in templateData) {
          parameters.push({
            type: 'text',
            text: templateData[key].toString(),
          });
        }

        if (parameters.length > 0) {
          components.push([
            {
              type: 'body',
              parameters: [...parameters],
            },
          ]);
        }
      }

      const response = await axios.post(
        `${BASE_URL}/${phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es',
            },
            components: [
              {
                type: 'header',
                parameters: [
                  {
                    type: 'image',
                    image: {
                      id: mediaId,
                    },
                  },
                ],
              },
              ...components,
            ],
          },
        },
        {
          headers: {
            Authorization: `OAuth ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('WhatsApp message response:', response.data);
      return true;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.log('🚀 ~ WhatsappService ~ error response:', error.response.data);
        throw new Error('Failed to send WhatsApp message : ' + error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.log('🚀 ~ WhatsappService ~ error request:', error.request);
        throw new Error('Failed to send WhatsApp message : ' + error.request);
      } else {
        // Something happened in setting up the request that triggered an error
        console.log('🚀 ~ WhatsappService ~ error message:', error.message);
        throw new Error('Failed to send WhatsApp message : ' + error.message);
      }
    }
  }

  public async sendNotificationTemplateMessageUsingWhatsApp(
    organizationId: number,
    phoneNumber: string,
    templateName: string,
    params: any,
  ): Promise<boolean> {
    try {
      const { phone_number_id, token } = await this.findIntegrationParameters(organizationId);
      // console.log('phone_number_id', phone_number_id);
      // console.log('token', token);
      let options = [];
      if (params.options && params.options.length > 0) {
        options = JSON.parse(params.options).map((btn: any, index: any) => {
          return {
            type: 'button',
            sub_type: 'quick_reply',
            index: index,
            parameters: [
              {
                type: 'payload',
                payload: btn.id,
              },
            ],
          };
        });
      }

      const response = await axios.post(
        `${BASE_URL}/${phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: params.user,
                  },
                ],
              },
              ...options,
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('WhatsApp message response:', response.data);
      return true;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.log('🚀 ~ WhatsappService ~ error response:', error.response.data);
        throw new Error('Failed to send WhatsApp message : ' + error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.log('🚀 ~ WhatsappService ~ error request:', error.request);
        throw new Error('Failed to send WhatsApp message : ' + error.request);
      } else {
        // Something happened in setting up the request that triggered an error
        console.log('🚀 ~ WhatsappService ~ error message:', error.message);
        throw new Error('Failed to send WhatsApp message : ' + error.message);
      }
    }
  }

  public async getTemplates(organizationId: number): Promise<void> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      const response = await axios.get(
        `${BASE_URL}/${business_id}/message_templates?fields=name,status&limit=3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('WhatsApp templates response:', response.data);
    } catch (error) {
      console.error('Failed to list WhatsApp templates:', error);
    }
  }

  public async deleteTemplate(organizationId: number, templateName: string): Promise<void> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      const response = await axios.delete(
        `${BASE_URL}/${business_id}/message_templates?name=${templateName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp delete template ${templateName} response:`, response.data);
    } catch (error) {
      console.error(`Failed to delete WhatsApp template ${templateName}:`, error);
    }
  }

  public async findTemplateById(organizationId: number, template_id: string): Promise<boolean> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:339 - WhatsappService - token:', token);
      console.log(
        '📌 - file: whatsapp.service.ts:340 - WhatsappService - business_id:',
        business_id,
      );
      const response = await axios.get(`${BASE_URL}/${template_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response?.data;
    } catch (error) {
      console.error('Failed to get WhatsApp template by Id:', error);
      return null;
    }
  }

  public async findTemplateByName(organizationId: number, name: string): Promise<boolean> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:361 - WhatsappService - token:', token);
      console.log(
        '📌 - file: whatsapp.service.ts:362 - WhatsappService - business_id:',
        business_id,
      );
      const response = await axios.get(
        `${BASE_URL}/${business_id}/message_templates?fields=name,status&name=${name}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const responseTemplate = response?.data?.data;
      return responseTemplate && responseTemplate.length > 0;
    } catch (error) {
      console.error('Failed to list WhatsApp templates:', error);
      return false;
    }
  }

  public async createTemplate(
    organizationId: number,
    name: string,
    content: string,
    examples: string[] = [],
  ): Promise<any> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:363 - WhatsappService - token:', token);
      console.log(
        '📌 - file: whatsapp.service.ts:364 - WhatsappService - business_id:',
        business_id,
      );

      let examplesObj = {};
      if (examples.length > 0) {
        examplesObj = {
          example: {
            body_text: [[...examples]],
          },
        };
      }

      const response = await axios.post(
        `${BASE_URL}/${business_id}/message_templates`,
        {
          name,
          language: 'es',
          category: 'MARKETING',
          components: [
            {
              type: 'BODY',
              text: `${content}`,
              ...examplesObj,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp create template ${name} response:`, response.data);
      if (response.data['status'].toLowerCase() === 'rejected') {
        this.deleteTemplate(organizationId, name);
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to create WhatsApp template ${name}:`, JSON.stringify(error, null, 2));
      return {
        status: 'error',
      };
    }
  }

  public async editTemplate(
    organizationId: number,
    name: string,
    templateId: string,
    content: string,
    examples: string[] = [],
  ): Promise<any> {
    try {
      const { token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:428 - WhatsappService - token:', token);

      let examplesObj = {};
      if (examples.length > 0) {
        examplesObj = {
          example: {
            body_text: [[...examples]],
          },
        };
      }

      const response = await axios.post(
        `${BASE_URL}/${templateId}`,
        {
          components: [
            {
              type: 'BODY',
              text: `${content}`,
              ...examplesObj,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp edit template ${name} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to edit WhatsApp template ${name}:`, JSON.stringify(error, null, 2));
      return {
        success: false,
      };
    }
  }

  public async requestUploadMedia(
    organizationId: number,
    fileName: string,
    fileLength: number,
    fileType: string,
  ) {
    const { token } = await this.findIntegrationParameters(organizationId);
    try {
      const response = await axios.post(
        `${BASE_URL}/${1009204570369867}/uploads?file_name=${fileName}&file_length=${fileLength.toString()}&file_type=${fileType}&access_token=${token}`,
      );
      const mediaId = response.data.id; // Get the media_id
      console.log('📌 - file: whatsapp.service.ts:361 - WhatsappService - mediaId:', mediaId);
      return mediaId;
    } catch (error) {
      console.error('Error uploading image:', error.response.data);
      throw error;
    }
  }

  public async uploadMedia(
    organizationId: number,
    filePath: string,
    mediaId: string,
    fileLength: number,
  ) {
    const { token } = await this.findIntegrationParameters(organizationId);
    const fileStream = fs.createReadStream(filePath);

    try {
      const response = await axios.post(`${BASE_URL}/${mediaId}`, fileStream, {
        headers: {
          Authorization: `OAuth ${token}`,
          file_offset: 0,
          'Content-Length': fileLength,
        },
        maxContentLength: Infinity, // To handle large files
        maxBodyLength: Infinity,
      });
      const fileHandle = response.data.h; // Get the media_id
      console.log('📌 - file: whatsapp.service.ts:390 - WhatsappService - fileHandle:', fileHandle);
      return fileHandle;
    } catch (error) {
      console.error('Error uploading image:', error.response.data);
      throw error;
    } finally {
      fileStream.close();
      this.deleteFile(filePath);
    }
  }

  public async createMediaTemplate(
    organizationId: number,
    name: string,
    fileHandle: string,
    type: string,
    fileName: string,
    footer: string,
    bodyContent: string,
    category: string,
    examples: string[] = [],
  ): Promise<any> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:532 - WhatsappService - token:', token);
      console.log(
        '📌 - file: whatsapp.service.ts:533 - WhatsappService - business_id:',
        business_id,
      );

      let examplesObj = {};
      let bodyFinalMsg = bodyContent;
      let footerFinalMsg = footer;

      if (bodyContent.length === 0 && footer.length === 0) {
        let bodyMsg = '';
        let footerMsg = 'compartido';
        if (type.toUpperCase() === 'IMAGE') {
          bodyMsg = 'Imagen';
          footerMsg = 'compartida';
        } else if (type.toUpperCase() === 'VIDEO') {
          bodyMsg = 'Video';
        } else if (type.toUpperCase() === 'DOCUMENT') {
          bodyMsg = 'Documento';
        }

        bodyFinalMsg = `${bodyMsg} ${fileName}`;
        footerFinalMsg = `${bodyMsg} ${footerMsg} por tu agente asignado.`;
      }

      if (examples.length > 0) {
        examplesObj = {
          example: {
            body_text: [[...examples]],
          },
        };
      }

      const listOfComponents = [
        {
          type: 'HEADER',
          format: type.toUpperCase(),
          example: {
            header_handle: [fileHandle],
          },
        },
        {
          type: 'BODY',
          text: `${bodyFinalMsg}`,
          ...examplesObj,
        },
        {
          type: 'FOOTER',
          text: `${footerFinalMsg}`,
        },
      ];

      console.log(
        '📌 - file: whatsapp.service.ts:513 - WhatsappService - listOfComponents:',
        JSON.stringify(listOfComponents),
      );

      const response = await axios.post(
        `${BASE_URL}/${business_id}/message_templates`,
        {
          name,
          language: 'es',
          category: category.toUpperCase(), // only accepts UTILITY, MARKETING or AUTHENTICATION
          components: [...listOfComponents],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp create template ${name} response:`, response.data);
      if (response.data['status'].toLowerCase() === 'rejected') {
        this.deleteTemplate(organizationId, name);
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to create WhatsApp template ${name}:`, JSON.stringify(error, null, 2));
      return {
        status: 'error',
      };
    }
  }

  public async editMediaTemplate(
    organizationId: number,
    name: string,
    templateId: string,
    fileHandle: string,
    type: string,
    fileName: string,
    footer: string,
    bodyContent: string,
    examples: string[] = [],
  ): Promise<any> {
    try {
      const { token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:632 - WhatsappService - token:', token);

      let examplesObj = {};
      let bodyFinalMsg = bodyContent;
      let footerFinalMsg = footer;

      if (bodyContent.length === 0 && footer.length === 0) {
        let bodyMsg = '';
        let footerMsg = 'compartido';
        if (type.toUpperCase() === 'IMAGE') {
          bodyMsg = 'Imagen';
          footerMsg = 'compartida';
        } else if (type.toUpperCase() === 'VIDEO') {
          bodyMsg = 'Video';
        } else if (type.toUpperCase() === 'DOCUMENT') {
          bodyMsg = 'Documento';
        }

        bodyFinalMsg = `${bodyMsg} ${fileName}`;
        footerFinalMsg = `${bodyMsg} ${footerMsg} por tu agente asignado.`;
      }

      if (examples.length > 0) {
        examplesObj = {
          example: {
            body_text: [[...examples]],
          },
        };
      }

      const listOfComponents = [
        {
          type: 'HEADER',
          format: type.toUpperCase(),
          example: {
            header_handle: [fileHandle],
          },
        },
        {
          type: 'BODY',
          text: `${bodyFinalMsg}`,
          ...examplesObj,
        },
        {
          type: 'FOOTER',
          text: `${footerFinalMsg}`,
        },
      ];

      console.log(
        '📌 - file: whatsapp.service.ts:681 - WhatsappService - listOfComponents:',
        JSON.stringify(listOfComponents),
      );

      const response = await axios.post(
        `${BASE_URL}/${templateId}`,
        {
          components: [...listOfComponents],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp edit template ${name} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to edit WhatsApp template ${name}:`, JSON.stringify(error, null, 2));
      return {
        success: false,
      };
    }
  }

  public async createNotificationsTemplate(
    organizationId: number,
    name: string,
    params: any,
  ): Promise<boolean> {
    try {
      const { business_id, token } = await this.findIntegrationParameters(organizationId);
      console.log('📌 - file: whatsapp.service.ts:564 - WhatsappService - token:', token);
      console.log(
        '📌 - file: whatsapp.service.ts:565 - WhatsappService - business_id:',
        business_id,
      );

      const options = JSON.parse(params.options).map((btn) => {
        return {
          type: 'QUICK_REPLY',
          text: btn.title,
        };
      });

      const response = await axios.post(
        `${BASE_URL}/${business_id}/message_templates`,
        {
          name,
          language: 'es',
          category: 'MARKETING',
          components: [
            {
              type: 'HEADER',
              format: 'TEXT',
              text: `${params.header}`,
            },
            {
              type: 'BODY',
              text: `Hola {{1}}! ${params.message}`,
              example: {
                body_text: [['Joe']],
              },
            },
            {
              type: 'FOOTER',
              text: `${params.footer}`,
            },
            {
              type: 'BUTTONS',
              buttons: [...options],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`WhatsApp create template ${name} response:`, response.data);
      if (response.data['status'].toLowerCase() === 'rejected') {
        this.deleteTemplate(organizationId, name);
      }
      return response.data['status'] === 'PENDING';
    } catch (error) {
      console.error(`Failed to create WhatsApp template ${name}:`, JSON.stringify(error, null, 2));
      return false;
    }
  }

  private async findIntegrationParameters(organizationId: number): Promise<IntegrationParameters> {
    //Get Started status
    const whatsappIntegrationType: ValueDefinition = await this.dbService.getValueDefinitionId(
      'INTEGRATION_TYPES',
      '010',
    );
    console.log(
      '📌 - file: whatsapp.service.ts:640 - WhatsappService - findIntegrationParameters - whatsappIntegrationType:',
      whatsappIntegrationType,
    );

    // Fetch the integration parameters for the organization
    const integration = await this.organizationIntegrationRepository.findOne({
      where: { organizationId, name: { id: whatsappIntegrationType.id } },
      relations: ['parameters'],
    });

    console.log(
      '📌 - file: whatsapp.service.ts:649 - WhatsappService - findIntegrationParameters - integration:',
      integration,
    );

    if (!integration) {
      console.error(`Integration for organization with id ${organizationId} not found.`);
      throw new Error('Integration not found');
    }

    const phoneParameter = integration.parameters.find((param) => param.name === 'phone_number');
    console.log(
      '📌 - file: whatsapp.service.ts:658 - WhatsappService - findIntegrationParameters - phoneParameter:',
      phoneParameter,
    );

    const phoneIdParameter = integration.parameters.find(
      (param) => param.name === 'phone_number_id',
    );
    console.log(
      '📌 - file: whatsapp.service.ts:662 - WhatsappService - findIntegrationParameters - phoneIdParameter:',
      phoneIdParameter,
    );

    const tokenParameter = integration.parameters.find((param) => param.name === 'token');
    console.log(
      '📌 - file: whatsapp.service.ts:664 - WhatsappService - findIntegrationParameters - tokenParameter:',
      tokenParameter,
    );

    const businessIdParameter = integration.parameters.find(
      (param) => param.name === 'business_id',
    );
    console.log(
      '📌 - file: whatsapp.service.ts:668 - WhatsappService - findIntegrationParameters - businessIdParameter:',
      businessIdParameter,
    );

    return {
      phone_number: phoneParameter.value,
      phone_number_id: phoneIdParameter.value,
      token: tokenParameter.value,
      business_id: businessIdParameter.value,
    };
  }

  // Method to download the file from a URL and write it to the disk
  public async downloadFileFromUrl(url: string, destinationPath: string): Promise<void> {
    const writer = fs.createWriteStream(destinationPath);

    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream', // Important to get the data as a stream
      });

      // Pipe the data from the response to the writable stream (file)
      response.data.pipe(writer);

      // Return a promise that resolves once the file has been successfully written
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', (error) => {
          console.error('Error writing the file:', error);
          reject(new HttpException('Error writing file', HttpStatus.INTERNAL_SERVER_ERROR));
        });
      });
    } catch (error) {
      console.error('Error downloading file from URL:', error);
      throw new HttpException('File download failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getFileLength(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats.size); // size is in bytes
        }
      });
    });
  }

  public getFileMime(extension: string): string {
    return `image/${extension}`;
  }

  public deleteFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
  }

  public checkPattern(regex: any, str: string) {
    return regex.test(str);
  }

  public countPattern(regex: any, str: string) {
    const matches = str.match(regex);
    return matches ? matches.length : 0;
  }
}
