import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterParentDto } from './dto/register-parent.dto';
import { IdentityService } from './identity.service';

@ApiTags('identity')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register-parent')
  registerParent(@Body() dto: RegisterParentDto) {
    return this.identityService.registerParent(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.identityService.login(dto);
  }
}
