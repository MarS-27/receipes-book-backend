import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecipeService } from 'src/recipe/recipe.service';
import {
  PaginatedResult,
  RecipeCategories,
  SessionRequest,
  TMessage,
} from 'src/types/global-types';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { filesUploadInterceptor } from 'src/utils/uploadInterceptors';
import { BodyParseInterceptor } from 'src/utils/parseFormDataInterceptor';
import { Recipe } from './entities/recipe.entity';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@ApiTags('Recipe Endpoints')
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @ApiOperation({ summary: 'Get paginated recipes.' })
  @ApiBearerAuth('Token')
  @ApiQuery({ name: 'category', enum: RecipeCategories })
  @ApiQuery({ name: 'isVeganHealthy', type: Boolean, required: false })
  @ApiOkResponse({
    description: 'Recipes has been succesfully got.',
    type: PaginatedResult<Recipe>,
  })
  @ApiNotFoundResponse({ description: 'User or Recipes not found.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occured when getting recipes.',
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @Get('paginated-recipes')
  @UseGuards(JwtAuthGuard)
  async getPaginatedRecipes(
    @Request() req: SessionRequest,
    @Query('category') category: RecipeCategories,
    @Query('isVeganHealthy') isVeganHealthy: string,
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ): Promise<PaginatedResult<Recipe>> {
    return this.recipeService.getPaginatedRecipes(
      req.user.id,
      category,
      limit,
      skip,
      JSON.parse(isVeganHealthy),
    );
  }

  @ApiOperation({ summary: 'Search Recipes by title.' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Recipes have been successfully searched.',
  })
  @ApiNotFoundResponse({ description: 'Recipes not found.' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred when searching recipes.',
  })
  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchProducts(
    @Request() req: SessionRequest,
    @Query('q') query: string,
  ): Promise<Recipe[]> {
    return this.recipeService.searchRecipes(req.user.id, query);
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

  @ApiOperation({ summary: 'Update Recipe.' })
  @ApiBearerAuth('Token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(filesUploadInterceptor, BodyParseInterceptor)
  @ApiOkResponse({ description: 'Recipe has been updated.' })
  @ApiNotFoundResponse({ description: 'Recipe not found.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occured when updating recipe.',
  })
  @ApiUnauthorizedResponse({
    description: 'User does not have Token. User Unauthorized.',
  })
  @Put('update/:recipeId')
  @UseGuards(JwtAuthGuard)
  updateRecipeData(
    @Request() req: SessionRequest,
    @Param('recipeId') recipeId: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @UploadedFiles()
    files: Express.Multer.File[],
  ): Promise<TMessage> {
    return this.recipeService.updateRecipeData(
      req.user.id,
      recipeId,
      updateRecipeDto,
      files,
    );
  }

  @ApiOperation({ summary: 'Delete recipe by id.' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({ description: 'Recipe has been deleted' })
  @ApiUnauthorizedResponse({
    description: 'User does not have valid Token. User Unauthorized.',
  })
  @ApiNotFoundResponse({ description: 'Recipe not found.' })
  @ApiInternalServerErrorResponse({
    description: 'An error occurred when deleting recipe.',
  })
  @Delete('delete/:recipeId')
  @UseGuards(JwtAuthGuard)
  deleteRecipe(
    @Request() req: SessionRequest,
    @Param('recipeId') recipeId: number,
  ): Promise<TMessage> {
    return this.recipeService.deleteRecipe(req.user.id, recipeId);
  }
}
