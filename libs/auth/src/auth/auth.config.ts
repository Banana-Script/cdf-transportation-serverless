import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfig {
  public adminUserPoolId: string = process.env.COGNITO_USER_POOL_ID;
  public adminClientId: string = process.env.COGNITO_CLIENT_ID;
  public adminRegion: string = process.env.REGION;
  public adminAuthority = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

  // public appUserPoolId: string = process.env.COGNITO_EMPLOYEE_USER_POOL_ID;
  // public appClientId: string = process.env.COGNITO_EMPLOYEE_CLIENT_ID;
  // public appRegion: string = process.env.COGNITO_EMPLOYEE_REGION;
  // public appAuthority = `https://cognito-idp.${process.env.COGNITO_EMPLOYEE_REGION}.amazonaws.com/${process.env.COGNITO_EMPLOYEE_USER_POOL_ID}`;
}
