import { ApiProperty } from '@nestjs/swagger';
import { RecipeCategories, RecipeStage } from 'src/types/global-types';
import { User } from 'src/user/entities/user.entity';
import { Base } from 'src/utils/base';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Recipe extends Base {
  @ApiProperty({ description: 'Recipe name' })
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    description: 'Recipe category',
    enum: RecipeCategories,
  })
  @Column({ nullable: false })
  category: RecipeCategories;

  @ApiProperty({
    description: 'File path on Cloudinary or null.',
    example: 'recipe-images/peatzskzjs6cyezperkx',
  })
  @Column({ nullable: true, default: null })
  titleImgPath: string | null;

  @ApiProperty({ description: 'Recipe short description' })
  @Column({ nullable: false })
  description: string;

  @ApiProperty({ description: 'Vegan flag' })
  @Column({ nullable: false, default: false })
  isVegan: boolean;

  @ApiProperty({
    description: 'List of ingredients',
    example: ['4 cups water', '1 large onion', '3 tablespoons vegetable oil'],
    type: 'string',
    isArray: true,
  })
  @Column('jsonb', { nullable: false })
  ingredients: string[];

  @ApiProperty({
    description: 'List of recipe stages',
    type: RecipeStage,
    isArray: true,
  })
  @Column('jsonb', { nullable: false })
  stages: RecipeStage[];

  @ApiProperty({ type: User })
  @ManyToOne(() => User, (user) => user.recipes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
