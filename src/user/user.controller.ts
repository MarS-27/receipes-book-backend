import {
  Body,
  ConflictException,
  Controller,
  Get,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TMessage } from '../types/global-types';
import { UserService } from './user.service';
import { SessionRequest } from 'src/types/global-types';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User Endpoints')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({ description: 'User profile has been updated.' })
  @ApiNotFoundResponse({ description: 'User is not found.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occured when updating the user.',
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have Token. User Unauthorized.',
  })
  @Put('/update')
  @UseGuards(JwtAuthGuard)
  updateUserData(
    @Request() req: SessionRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<TMessage> {
    return this.userService.updateUserData(req.user.id, updateUserDto);
  }
}
