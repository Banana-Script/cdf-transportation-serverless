import { Injectable } from "@nestjs/common";
import { TwilioService } from "@app/twilio";
// Import AWS Encryption SDK as per Cognito documentation
import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';

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
  private readonly encryptionClient: { encrypt: any; decrypt: any };

  constructor(private readonly twilioService: TwilioService) {
    console.log("Inicializando Custom SMS Sender Service");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("AWS_PROFILE:", process.env.AWS_PROFILE);

    // Initialize AWS Encryption SDK client with proper commitment policy
    this.encryptionClient = buildClient(
      CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT
    );
  }

  async handleEvent(event: CustomSMSSenderEvent): Promise<void> {
    // console.log('Custom SMS Sender Event:', JSON.stringify(event, null, 2));

    const { request, triggerSource, userName } = event;

    try {
      // Desencriptar el código usando KMS
      const decryptedCode = await this.decryptCode(request.code, event.userPoolId);
      console.log("Código desencriptado exitosamente");

      // Determinar el número de teléfono del usuario
      const phoneNumber = await this.getUserPhoneNumber(
        event.userPoolId,
        userName
      );

      if (!phoneNumber) {
        throw new Error(
          `No se encontró número de teléfono para el usuario: ${userName}`
        );
      }

      // Construir el mensaje personalizado según el tipo
      let message = "";

      switch (triggerSource) {
        case "CustomSMSSender_SignUp":
        case "CustomSMSSender_ResendCode":
          message = `Tu código de verificación para COORSERPARK APP es: ${decryptedCode}`;
          break;

        case "CustomSMSSender_ForgotPassword":
          message = `Tu código para restablecer la contraseña en COORSERPARK APP es: ${decryptedCode}`;
          break;

        case "CustomSMSSender_UpdateUserAttribute":
          message = `Tu código de verificación para actualizar información en COORSERPARK APP es: ${decryptedCode}`;
          break;

        case "CustomSMSSender_VerifyUserAttribute":
          message = `Tu código de verificación de atributo para COORSERPARK APP es: ${decryptedCode}`;
          break;

        case "CustomSMSSender_Authentication":
          message = `Tu código de autenticación para COORSERPARK APP es: ${decryptedCode}`;
          break;

        default:
          message = `Tu código de verificación para COORSERPARK APP es: ${decryptedCode}`;
          break;
      }

      // Enviar SMS por Twilio
      await this.twilioService.sendSMS(phoneNumber, message);

      console.log(
        `[${triggerSource}] SMS enviado exitosamente por Twilio a: ${phoneNumber} para usuario: ${userName}`
      );
    } catch (error) {
      console.error(
        `Error en Custom SMS Sender para usuario ${userName}:`,
        error
      );
      throw error;
    }
  }

  private async decryptCode(encryptedCode: string, userPoolId?: string): Promise<string> {
    try {
      console.log("Código encriptado recibido:", encryptedCode);
      console.log("User Pool ID:", userPoolId);

      // Validar que el código no esté vacío
      if (!encryptedCode || encryptedCode.trim().length === 0) {
        throw new Error("El código encriptado está vacío");
      }

      // Decode base64 encrypted code
      const ciphertextBuffer = Buffer.from(encryptedCode, "base64");
      console.log("Buffer creado, tamaño:", ciphertextBuffer.length);

      // Create KMS keyring in discovery mode to let it find the key from ciphertext
      const keyring = new KmsKeyringNode({ 
        discovery: true 
      });
      
      console.log("🔐 Usando AWS Encryption SDK para desencriptar...");
      
      // Decrypt using AWS Encryption SDK with proper client instance
      const { decrypt } = this.encryptionClient;
      const { plaintext, messageHeader } = await decrypt(keyring, ciphertextBuffer);
      
      console.log("✅ Desencriptación exitosa con AWS Encryption SDK");
      console.log("Encryption context:", messageHeader.encryptionContext);
      
      const decryptedCode = plaintext.toString('utf-8');
      console.log("Código desencriptado, longitud:", decryptedCode.length);
      
      // Unescape HTML characters as per documentation
      const unescapedCode = decryptedCode
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
      
      console.log("Código final después de unescape:", unescapedCode);
      return unescapedCode;
    } catch (error) {
      console.error("Error desencriptando código:", error);
      console.error("Tipo de error:", error.constructor.name);
      console.error("Código de error:", error.code);
      console.error("Mensaje de error:", error.message);

      // Log additional diagnostic info for UnrecognizedClientException
      if (error.code === "UnrecognizedClientException") {
        console.error("🚨 DIAGNÓSTICO: Token de seguridad inválido");
        console.error("- Verifique que Lambda use rol IAM correctamente");
        console.error(
          "- Rol configurado:",
          process.env.AWS_ROLE_ARN || "No configurado"
        );
        console.error(
          "- Región Lambda:",
          process.env.AWS_REGION || process.env.REGION
        );
        console.error("- NODE_ENV actual:", process.env.NODE_ENV);
      }

      // Re-lanzar con más información para producción
      if (error.code === "InvalidCiphertextException") {
        throw new Error(
          `InvalidCiphertextException: El código encriptado no es válido o la clave KMS no coincide. Código: ${encryptedCode.substring(0, 50)}...`
        );
      }

      if (error.code === "UnrecognizedClientException") {
        throw new Error(
          `UnrecognizedClientException: Token de seguridad inválido. Verifique configuración de IAM role y región.`
        );
      }

      throw error;
    }
  }

  private async getUserPhoneNumber(
    userPoolId: string,
    userName: string
  ): Promise<string | null> {
    try {
      // Importar CognitoIdentityServiceProvider aquí para evitar problemas de importación
      const { CognitoIdentityServiceProvider } = await import("aws-sdk");
      const cognito = new CognitoIdentityServiceProvider({
        region: process.env.REGION || "us-east-1",
      });

      const params = {
        UserPoolId: userPoolId,
        Username: userName,
      };

      const result = await cognito.adminGetUser(params).promise();

      const phoneNumberAttr = result.UserAttributes?.find(
        (attr) => attr.Name === "phone_number"
      );

      return phoneNumberAttr?.Value || null;
    } catch (error) {
      console.error("Error obteniendo número de teléfono del usuario:", error);
      throw error;
    }
  }
}
