import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecipeService } from 'src/recipe/recipe.service';
import {
  PaginatedResult,
  SessionRequest,
  TMessage,
} from 'src/types/global-types';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { filesUploadInterceptor } from 'src/utils/uploadInterceptors';
import { BodyParseInterceptor } from 'src/utils/parseFormDataInterceptor';
import { Recipe } from './entities/recipe.entity';

@ApiTags('Recipe Endpoints')
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @ApiOperation({ summary: 'Get paginated recipes.' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Recipes has been succesfully got.',
    type: PaginatedResult<Recipe>,
  })
  @ApiNotFoundResponse({ description: 'User or Recipes not found.' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Get('paginated-recipes')
  @UseGuards(JwtAuthGuard)
  async getPaginatedRecipes(
    @Request() req: SessionRequest,
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ): Promise<PaginatedResult<Recipe>> {
    return this.recipeService.getPaginatedRecipes(req.user.id, limit, skip);
  }

  @ApiOperation({ summary: 'Get recipe by id.' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({ description: 'Recipe has been succesfully got.' })
  @ApiNotFoundResponse({ description: 'Recipe not found.' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Get(':recipeId')
  @UseGuards(JwtAuthGuard)
  async getRecipeById(
    @Request() req: SessionRequest,
    @Param('recipeId') recipeId: number,
  ): Promise<Recipe> {
    return this.recipeService.getRecipeById(req.user.id, recipeId);
  }

  @ApiOperation({ summary: 'Create new recipe.' })
  @ApiBearerAuth('Token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(filesUploadInterceptor, BodyParseInterceptor)
  @ApiCreatedResponse({ description: 'Recipe has been succesfully created.' })
  @ApiNotFoundResponse({ description: 'User does not exist.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occured when creating new recipe.',
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createRecipe(
    @Request() req: SessionRequest,
    @Body()
    createRecipeDto: CreateRecipeDto,
    @UploadedFiles()
    files: Express.Multer.File[],
  ): Promise<TMessage> {
    return this.recipeService.createRecipe(req.user.id, createRecipeDto, files);
  }
}
