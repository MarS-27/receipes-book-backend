import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  SessionRequest,
  TLogin,
  TToken,
  TUserRequest,
} from 'src/types/global-types';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registration-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('User Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Registration.' })
  @ApiCreatedResponse({
    description: 'User has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'This email is already existed!' })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred when saving the new User.',
  })
  @Post('registration')
  @UsePipes(new ValidationPipe())
  userRegistration(@Body() registerUserDto: RegisterUserDto): Promise<TToken> {
    return this.userService.userRegistration(registerUserDto);
  }

  @ApiOperation({ summary: 'User Login.' })
  @ApiUnauthorizedResponse({ description: 'Incorrect Email or Password.' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() LoginUserDto: LoginUserDto,
    @Request() req: SessionRequest,
  ): Promise<TLogin> {
    return this.authService.login(req.user);
  }
}
