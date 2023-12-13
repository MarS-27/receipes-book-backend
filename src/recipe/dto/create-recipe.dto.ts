import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RecipeStage } from 'src/types/global-types';

type TFile = Express.Multer.File & { fileInputIndicator: string };

export class CreateRecipeDto {
  // @ApiProperty({ description: 'Recipe name' })
  // @IsString()
  // title: string;

  // @ApiProperty({
  //   description:
  //     'File path on Cloudinary, got as result after uploud image on Cloudinary.',
  //   example: 'recipe-images/peatzskzjs6cyezperkx',
  // })
  // @IsString()
  // titleImg: string;

  // @ApiProperty({ description: 'Recipe short description' })
  // @IsString()
  // description: string;

  // @ApiProperty({
  //   description: 'List of ingredients',
  //   isArray: true,
  //   example: ['4 cups water', '1 large onion', '3 tablespoons vegetable oil'],
  // })
  // @IsOptional()
  // ingredients: string[];

  // @ApiProperty({
  //   description: 'List of recipe stages',
  //   isArray: true,
  //   type: RecipeStage,
  // })
  // @IsOptional({ each: true })
  // stages: RecipeStage[];

  @ApiProperty({ type: 'TFile', format: 'binary', isArray: true })
  files: TFile[];
}
