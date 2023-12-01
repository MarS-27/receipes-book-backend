import { ApiProperty } from '@nestjs/swagger';
import { ImageFile } from 'src/global-entities/image.entity';
import { Base } from 'src/utils/base';
import { Column, Entity, OneToMany } from 'typeorm';

class RecipeStage {
  @ApiProperty({ nullable: false, example: '1 or Step 1' })
  stageNumber: number;

  @ApiProperty()
  img: ImageFile;

  @ApiProperty({
    nullable: false,
    example:
      'Heat oil in a large pot over medium-high heat; add beef and cook until well browned.',
  })
  description: string;
}

@Entity()
export class Recipe extends Base {
  @ApiProperty({ description: 'Recipe name' })
  @Column({ nullable: false })
  title: string;

  @ApiProperty({ description: 'ID of the recipe title-image' })
  @Column({ nullable: false })
  titleImg: number;

  @ApiProperty({ description: 'Recipe short description' })
  @Column()
  description: string;

  @ApiProperty({
    description: 'List of ingredients',
    example: "['4 cups water', '1 large onion', '3 tablespoons vegetable oil']",
  })
  @Column({ nullable: false })
  ingredients: string[];

  @ApiProperty({ description: 'List of recipe stages', type: RecipeStage })
  @Column({ nullable: false })
  stages: RecipeStage[];

  //   @ApiProperty()
  //   @OneToMany(() => Comment, (comment) => comment.recipe)
  //   wallet: Comment[];

  //   @ApiProperty()
  //   @OneToMany(() => Likes, (like) => like.recipe)
  //   wallet: Likes[];
}
