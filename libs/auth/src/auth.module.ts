import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthConfig } from './auth/auth.config';

@Module({
  imports: [PassportModule.register({ strategy: 'jwt' })],
  providers: [AuthConfig, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
