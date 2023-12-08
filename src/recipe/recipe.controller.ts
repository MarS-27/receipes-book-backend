import {
  Body,
  Request,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecipeService } from 'src/recipe/recipe.service';
import { TMessage } from 'src/types/global-types';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@ApiTags('Recipe Endpoints')
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @ApiOperation({ summary: 'Create new recipe' })
  @ApiBearerAuth('Token')
  @ApiCreatedResponse({ description: 'Recipe has been succesfully created' })
  @ApiNotFoundResponse({ description: 'User does not exist' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createTask(
    @Request() req,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<TMessage> {
    return this.recipeService.createRecipe(req.user.id, createRecipeDto);
  }
}
