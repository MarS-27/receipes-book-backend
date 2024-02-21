import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TMessage, TUserRequest } from '../types/global-types';
import { UserService } from './user.service';
import { SessionRequest } from 'src/types/global-types';
import { UpdateUserDto } from './dto/update-user.dto';
import { fileUploadInterceptor } from 'src/utils/uploadInterceptors';

@ApiTags('User Endpoints')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get User Profile.' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Profile has been successfully got.',
  })
  @ApiUnauthorizedResponse({
    description: 'Need User Token for Getting User Profile',
  })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: SessionRequest): Promise<TUserRequest> {
    return this.userService.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Update User Profile.' })
  @ApiBearerAuth('Token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(fileUploadInterceptor)
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
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<TMessage> {
    return this.userService.updateUserData(req.user.id, updateUserDto, file);
  }

  @ApiOperation({ summary: 'Delete User Profile.' })
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
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req: SessionRequest): Promise<TMessage> {
    return this.userService.deleteUserProfile(req.user.id);
  }
}
