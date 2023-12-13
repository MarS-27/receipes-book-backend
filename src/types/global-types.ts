import { ApiProperty } from '@nestjs/swagger/dist';
import { User } from 'src/user/entities/user.entity';

export type TToken = {
  token: string;
};

export type TMessage = {
  message: string;
};

export type TTUserRequest = {
  id: number;
  email: string;
  img: string;
  userName: string;
};

export type TLogin = TTUserRequest & TToken;

export type SessionRequest = Express.Request & { user: TTUserRequest };

export class RecipeStage {
  @ApiProperty({ nullable: false, example: 1 })
  stageNumber: string;

  @ApiProperty({
    description:
      'File path on Cloudinary, got as result after uploud image on Cloudinary.',
    example: 'recipe-images/peatzskzjs6cyezperkx',
    nullable: true,
  })
  img: string | null;

  @ApiProperty({
    nullable: false,
    example:
      'Heat oil in a large pot over medium-high heat; add beef and cook until well browned.',
  })
  description: string;
}
