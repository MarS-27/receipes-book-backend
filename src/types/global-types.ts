import { ApiProperty } from '@nestjs/swagger/dist';

export type TToken = {
  token: string;
};

export type TMessage = {
  message: string;
};

export type TUserRequest = {
  id: number;
  email: string;
  imgPath: string;
  userName: string;
};

export type TLogin = TUserRequest & TToken;

export type SessionRequest = Express.Request & { user: TUserRequest };

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

export class PaginatedResult<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  skip: number;

  @ApiProperty({ type: () => [Object] })
  results: TData[];
}

export enum RecipeCategories {
  All = 'All',
  Deserts = 'Deserts',
  Salads = 'Salads',
  Soups = 'Soups',
  Appetizer = 'Appetizer',
  Others = 'Others',
}
