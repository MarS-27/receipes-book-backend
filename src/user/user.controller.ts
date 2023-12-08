import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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

  @ApiOperation({ summary: 'Delete User Profile' })
  @ApiOkResponse({
    description: 'User has been successfully deleted.',
  })
  @ApiBearerAuth('Token')
  @ApiNotFoundResponse({ description: 'User does not exist.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred when deleting the user profile.',
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have Token. User Unauthorized.',
  })
  @Delete('delete-user')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req: SessionRequest): Promise<TMessage> {
    return this.userService.deleteUserProfile(req.user.id);
  }
}
