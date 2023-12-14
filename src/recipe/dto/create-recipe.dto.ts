import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { RecipeStage } from 'src/types/global-types';

export class CreateRecipeDto {
  @ApiProperty({ description: 'Recipe name' })
  @IsString()
  title: string;

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
        "imgPath": "recipe-images/peatzskzjs6cyezperkx",
        "description": "Heat oil in a large pot over medium-high heat; add beef and cook until well browned."
      },
      {
        "stageNumber": "1",
        "imgPath": "recipe-images/peatzskzjs6cyezperkx",
        "description": "Heat oil in a large pot over medium-high heat; add beef and cook until well browned."
      }
    ]`,
  })
  @IsOptional()
  stages: RecipeStage[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: Express.Multer.File[];
}
