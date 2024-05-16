import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { RecipeCategories, RecipeStage } from 'src/types/global-types';

export class UpdateRecipeDto {
  @ApiPropertyOptional({ description: 'Recipe name' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Recipe category',
    enum: Object.values(RecipeCategories).filter(
      (value) => value !== RecipeCategories.All,
    ),
  })
  @IsString()
  category: RecipeCategories;

  @ApiPropertyOptional({
    description: 'File originalname or null.',
    example: 'cat.jpg',
  })
  @IsString()
  titleImgPath: string;

  @ApiPropertyOptional({ description: 'Recipe short description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Vegan/Healthy flag' })
  @IsBoolean()
  isVeganHealthy: boolean;

  @ApiPropertyOptional({
    description: 'List of ingredients',
    type: String,
    example: '["1 large onion", "2 tomatoes"]',
  })
  @IsOptional()
  ingredients: string[];

  @ApiPropertyOptional({
    description:
      'List of recipe stages. You should transmit the entire object of stages from the database with the changes made. To modify an image, indicate the original name of the uploaded image. To delete, transmit null.',
    type: RecipeStage,
    example: `[
        {
          "stageNumber": "1",
          "imgPath": null,
          "description": "Heat oil in a large pot over medium-high heat; add beef and cook until well browned."
        },
        {
          "stageNumber": "2",
          "imgPath": "recipe-images/jazgseo8zcwhp1o0k7lw",
          "description": "Heat oil in a large pot over medium-high heat; add beef and cook until well browned."
        }
      ]`,
  })
  @IsOptional()
  stages: RecipeStage[];

  @ApiPropertyOptional({
    description:
      'List of recipe images. Each image corresponds to a position in the recipe. If no images are added, please check "Send empty value"',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: Express.Multer.File[];
}
