import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('User Endpoints')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'User Profile has successfully got.',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({
    description: 'User does not have Token. User Unauthorized.',
  })
  @ApiConflictResponse({
    description: 'Current user does not have any rights.',
  })
  @Get('/account')
  @UseGuards(JwtAuthGuard)
  getUserData(@Request() req): Promise<User> {
    return this.userService.getUserData(req.user.id);
  }
}
