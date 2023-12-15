import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecipeService } from 'src/recipe/recipe.service';
import { SessionRequest, TMessage } from 'src/types/global-types';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { filesUploadInterceptor } from 'src/utils/uploadInterceptors';
import { BodyParseInterceptor } from 'src/utils/parseFormDataInterceptor';

@ApiTags('Recipe Endpoints')
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @ApiOperation({ summary: 'Create new recipe' })
  @ApiBearerAuth('Token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(filesUploadInterceptor, BodyParseInterceptor)
  @ApiCreatedResponse({ description: 'Recipe has been succesfully created' })
  @ApiNotFoundResponse({ description: 'User does not exist' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createTask(
    @Request() req: SessionRequest,
    @Body()
    createRecipeDto: CreateRecipeDto,
    @UploadedFiles()
    files: Express.Multer.File[],
  ): Promise<TMessage> {
    return this.recipeService.createRecipe(req.user.id, createRecipeDto, files);
  }
}
