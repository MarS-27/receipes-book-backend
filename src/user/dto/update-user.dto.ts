import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  userName: string;

  @ApiProperty({
    description:
      'File path on Cloudinary, got as result after uploud image on Cloudinary.',
    example: 'recipe-images/peatzskzjs6cyezperkx',
  })
  @IsOptional()
  img: string;
}
