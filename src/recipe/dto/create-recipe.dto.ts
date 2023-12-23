import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RecipeCategories, RecipeStage } from 'src/types/global-types';

export class CreateRecipeDto {
  @ApiProperty({ description: 'Recipe name' })
  @IsString()
  title: string;

  @ApiProperty({
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

  @ApiProperty({ description: 'Recipe short description' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'List of ingredients',
    type: String,
    example: '["1 large onion", "2 tomatoes"]',
  })
  @IsOptional()
  ingredients: string[];

  @ApiProperty({
    description: 'List of recipe stages',
    type: RecipeStage,
    example: `[
      {
        "stageNumber": "1",
        "imgPath": null,
        "description": "Heat oil in a large pot over medium-high heat; add beef and cook until well browned."
      },
      {
        "stageNumber": "2",
        "imgPath": "image.jpg",
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
