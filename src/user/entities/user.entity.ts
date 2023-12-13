import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Recipe } from 'src/recipe/entities/recipe.entity';
import { Base } from 'src/utils/base';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends Base {
  @ApiProperty({ description: 'User email', example: 'test@test.com' })
  @Column({ unique: true, nullable: false })
  email: string;

  @ApiProperty({ description: 'User name', example: 'Anna' })
  @Column({ default: '' })
  userName: string;

  @ApiProperty({
    description: 'Password for user account',
    example: 'test12345',
  })
  @Column({ nullable: false })
  @Exclude()
  password: string;

  @ApiProperty({
    description:
      'File path on Cloudinary, got as result after uploud image on Cloudinary.',
    example: 'user-images/wdndt6e93sp6dtncoksc',
  })
  @Column({ nullable: true })
  imgPath: string | null;

  @ApiProperty()
  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];

  //   @ApiProperty()
  //   @OneToMany(() => Expense, (expense) => expense.user)
  //   expense: Expense[];
}
