import { ApiProperty } from '@nestjs/swagger';
import { RecipeStage } from 'src/types/global-types';
import { User } from 'src/user/entities/user.entity';
import { Base } from 'src/utils/base';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Recipe extends Base {
  @ApiProperty({ description: 'Recipe name' })
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    description:
      'File path on Cloudinary, got as result after uploud image on Cloudinary.',
    example: 'recipe-images/peatzskzjs6cyezperkx',
  })
  @Column({ nullable: false })
  titleImg: string;

  @ApiProperty({ description: 'Recipe short description' })
  @Column()
  description: string;

  @ApiProperty({
    description: 'List of ingredients',
    example: ['4 cups water', '1 large onion', '3 tablespoons vegetable oil'],
  })
  @Column('jsonb', { nullable: false })
  ingredients: string[];

  @ApiProperty({ description: 'List of recipe stages', type: RecipeStage })
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
