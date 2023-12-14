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
  @ApiProperty({ example: 1 })
  stageNumber: string;

  @ApiProperty({
    description:
      'File path on Cloudinary or null / File originalname or null when fetched on client',
    example: 'recipe-images/peatzskzjs6cyezperkx',
  })
  imgPath: string | null;

  @ApiProperty({
    example:
      'Heat oil in a large pot over medium-high heat; add beef and cook until well browned.',
  })
  description: string;
}
