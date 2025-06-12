import { Injectable } from "@nestjs/common";
import { CustomMessageTriggerEvent } from "aws-lambda";

@Injectable()
export class CognitoMessagesService {
  handleEvent(event: CustomMessageTriggerEvent): CustomMessageTriggerEvent {
    console.log("event", JSON.stringify(event, null, 2));

    const { triggerSource, request } = event;
    const userAttributes = request.userAttributes;
    const givenName = userAttributes.name || "";
    const appUrl = process.env.APP_URL || "https://dev-voiceaudit.capillasdelafe.com/";
    // Eliminar la barra final si existe para construir URLs consistentemente
    const baseUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;

    let emailSubject = "";
    let emailMessage = "";

    switch (triggerSource) {
      case "CustomMessage_ForgotPassword":
        const codePlaceholder = "{####}";
        const usernamePlaceholder = "{username}";

        emailSubject = "Recuperar contraseña";

        emailMessage = `
<!DOCTYPE html>
<html>
<head>
  <title>${emailSubject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f2f2f2; font-family:Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f2f2f2;">
    <tr>
      <td align="center">
        <!-- Main container -->
        <table width="800" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
          <!-- Banner Section -->
          <tr>
            <td style="background-color:#141518;" align="center" valign="middle" height="200">
              <table width="100%" height="200" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" valign="middle">
                    <img src="${baseUrl}/assets/images/auth/LogoWhite.png"
                         alt="cdf-call.com | Especialistas en trámites migratorios | Consulta Gratis"
                         width="350" height="73"
                         style="display:block; margin:0 auto; border:none; outline:none; text-decoration:none;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content Section -->
          <tr>
            <td style="padding:96px 136px 0 136px; text-align:left;">
              <h1 style="font-size:32px; font-weight:bold; color:#032159; margin:0 0 20px 0;">${emailSubject}</h1>
              <h2 style="font-size:24px; font-weight:bold; color:#000000; margin:0 0 10px 0;">Hola, ${givenName}</h2>
              <p style="font-size:16px; line-height:1.4; color:#434343; margin:0 0 20px 0;">
                Tu código de verificación es ${codePlaceholder}
              </p>
              <p style="font-size:32px; line-height:1.4; color:#e35825; margin:20px 0; font-weight:bold;">
                
              </p>
              <p style="font-size:16px; line-height:23px; color:#FFA185; margin:0 0 20px 0; font-weight:700">
                Por favor, no comparta esta información con nadie.
              </p>

              <!-- Divider line -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:40px 0 20px 0;">
                <tr>
                  <td style="border-top:1px solid #eeeeee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <p style="font-family:Arial,sans-serif; font-size:14px; line-height:22px; font-weight:bold; color:#6D737B; margin:0 0 40px 0;">
                cdf-call © Copyright 2025
              </p>

              <!-- Hidden Username Placeholder -->
              <div style="display:none;">${usernamePlaceholder}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
        event.response.emailSubject = emailSubject;
        event.response.emailMessage = emailMessage;
        break;

      case "CustomMessage_AdminCreateUser":
        emailSubject = "Contraseña temporal";

        // Template matching Figma design
        emailMessage = `
<!DOCTYPE html>
<html>
<head>
  <title>${emailSubject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f2f2f2; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;">
    <tr>
      <td align="center">
        <table width="800" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;">
        <!-- Banner Section -->
          <tr>
            <td style="background-color:#141518;" align="center" valign="middle" height="200">
              <table width="100%" height="200" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" valign="middle">
                    <img src="${baseUrl}/assets/images/auth/LogoWhite.png"
                         alt="cdf-call.com | Especialistas en trámites migratorios | Consulta Gratis"
                         width="300" height="73"
                         style="display:block; margin:0 auto; border:none; outline:none; text-decoration:none;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content Section -->
          <tr>
            <td style="padding:96px 136px 0 136px; text-align:left;">
              <h1 style="font-size:32px; font-weight:bold; color:#000000; margin:0 0 40px 0;">
                Contraseña temporal
              </h1>
              <h2 style="font-size:24px; font-weight:bold; color:#000000; margin:0 0 20px 0;">
                Hola, ${givenName}
              </h2>
              <p style="font-size:16px; line-height:1.4; color:#343434; margin:0 0 20px 0;">
                Tu usuario es <a href="mailto:{username}" style="color:#032159; text-decoration:none; font-weight:bold;">{username}</a> 
                y tu contraseña temporal es <span style="color:#032159; font-weight:bold;">{####}</span>
              </p>

              <p style="font-size:16px; line-height:1.4; color:#343434; margin:0 0 40px 0;">
                Inicia sesión y cambia tu contraseña inmediatamente.
              </p>

              <p style="font-size:16px; line-height:1.4; color:#e35825; margin:0 0 40px 0; font-weight:500;">
                Por favor, no compartas esta información con nadie.
              </p>

              <!-- Divider line -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0 20px 0;">
                <tr>
                  <td style="border-top:1px solid #eeeeee; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <p style="font-family:Arial,sans-serif; font-size:14px; line-height:22px; font-weight:bold; color:#6D737B; margin:0 0 40px 0;">
                cdf-call.COM © Copyright 2025
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

        event.response.emailSubject = emailSubject;
        event.response.emailMessage = emailMessage;
        break;

      default:
        // No custom message modifications
        break;
    }

    console.log(
      "🤖 ~ cognito-messages.service.ts:160 ~ CognitoMessagesService ~ handleEvent ~ event:",
      event
    );
    return event;
  }
}
