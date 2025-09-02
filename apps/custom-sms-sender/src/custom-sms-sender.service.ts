import { Injectable } from '@nestjs/common';
import { TwilioService } from '@app/twilio';
import { KMS } from 'aws-sdk';

interface CustomSMSSenderEvent {
  version: string;
  triggerSource: string;
  region: string;
  userPoolId: string;
  userName: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  request: {
    type: string;
    message: string;
    code: string; // Este es el código encriptado
  };
}

@Injectable()
export class CustomSMSSenderService {
  private kms: KMS;

  constructor(private readonly twilioService: TwilioService) {
    const region = process.env.REGION || 'us-east-1';
    console.log('Inicializando KMS con región:', region);
    this.kms = new KMS({ region });
  }

  async handleEvent(event: CustomSMSSenderEvent): Promise<void> {
    console.log('Custom SMS Sender Event:', JSON.stringify(event, null, 2));

    const { request, triggerSource, userName } = event;
    
    try {
      // Desencriptar el código usando KMS
      const decryptedCode = await this.decryptCode(request.code);
      console.log('Código desencriptado exitosamente');

      // Determinar el número de teléfono del usuario
      const phoneNumber = await this.getUserPhoneNumber(event.userPoolId, userName);
      
      if (!phoneNumber) {
        throw new Error(`No se encontró número de teléfono para el usuario: ${userName}`);
      }

      // Construir el mensaje personalizado según el tipo
      let message = '';
      
      switch (triggerSource) {
        case 'CustomSMSSender_SignUp':
        case 'CustomSMSSender_ResendCode':
          message = `Tu código de verificación para COORSERPARK APP es: ${decryptedCode}`;
          break;
          
        case 'CustomSMSSender_ForgotPassword':
          message = `Tu código para restablecer la contraseña en COORSERPARK APP es: ${decryptedCode}`;
          break;
          
        case 'CustomSMSSender_UpdateUserAttribute':
          message = `Tu código de verificación para actualizar información en COORSERPARK APP es: ${decryptedCode}`;
          break;
          
        case 'CustomSMSSender_VerifyUserAttribute':
          message = `Tu código de verificación de atributo para COORSERPARK APP es: ${decryptedCode}`;
          break;
          
        case 'CustomSMSSender_Authentication':
          message = `Tu código de autenticación para COORSERPARK APP es: ${decryptedCode}`;
          break;
          
        default:
          message = `Tu código de verificación para COORSERPARK APP es: ${decryptedCode}`;
          break;
      }

      // Enviar SMS por Twilio
      await this.twilioService.sendSMS(phoneNumber, message);
      
      console.log(`[${triggerSource}] SMS enviado exitosamente por Twilio a: ${phoneNumber} para usuario: ${userName}`);

    } catch (error) {
      console.error(`Error en Custom SMS Sender para usuario ${userName}:`, error);
      throw error;
    }
  }

  private async decryptCode(encryptedCode: string): Promise<string> {
    try {
      console.log('Código encriptado recibido:', encryptedCode);
      console.log('Longitud del código:', encryptedCode.length);
      
      // Validar que el código no esté vacío
      if (!encryptedCode || encryptedCode.trim().length === 0) {
        throw new Error('El código encriptado está vacío');
      }

      // Intentar decodificar base64 para validar formato
      let ciphertextBuffer: Buffer;
      try {
        ciphertextBuffer = Buffer.from(encryptedCode, 'base64');
        console.log('Buffer creado exitosamente, tamaño:', ciphertextBuffer.length);
      } catch (error) {
        console.error('Error creando buffer desde base64:', error);
        throw new Error('El código encriptado no es un base64 válido');
      }

      const params = {
        CiphertextBlob: ciphertextBuffer,
        // No especificar KeyId - KMS usará automáticamente la clave correcta
      };

      console.log('Intentando desencriptar con KMS...');
      console.log('Región de KMS configurada:', this.kms.config.region);
      
      // Extraer información de la clave del ciphertext para debugging
      console.log('Los primeros 100 chars del ciphertext:', encryptedCode.substring(0, 100));
      
      const result = await this.kms.decrypt(params).promise();
      
      console.log('KeyId utilizada por KMS:', result.KeyId);
      
      if (!result.Plaintext) {
        throw new Error('KMS retornó resultado vacío');
      }

      const decryptedCode = result.Plaintext.toString('utf-8');
      console.log('Desencriptación exitosa, código tiene longitud:', decryptedCode.length);
      
      return decryptedCode;
    } catch (error) {
      console.error('Error desencriptando código:', error);
      console.error('Tipo de error:', error.constructor.name);
      console.error('Código de error:', error.code);
      
      // Re-lanzar con más información
      if (error.code === 'InvalidCiphertextException') {
        throw new Error(`InvalidCiphertextException: El código encriptado no es válido o la clave KMS no coincide. Código original: ${encryptedCode.substring(0, 50)}...`);
      }
      
      throw error;
    }
  }

  private async getUserPhoneNumber(userPoolId: string, userName: string): Promise<string | null> {
    try {
      // Importar CognitoIdentityServiceProvider aquí para evitar problemas de importación
      const { CognitoIdentityServiceProvider } = await import('aws-sdk');
      const cognito = new CognitoIdentityServiceProvider({ 
        region: process.env.REGION || 'us-east-1' 
      });

      const params = {
        UserPoolId: userPoolId,
        Username: userName,
      };

      const result = await cognito.adminGetUser(params).promise();
      
      const phoneNumberAttr = result.UserAttributes?.find(
        attr => attr.Name === 'phone_number'
      );

      return phoneNumberAttr?.Value || null;
    } catch (error) {
      console.error('Error obteniendo número de teléfono del usuario:', error);
      throw error;
    }
  }
}