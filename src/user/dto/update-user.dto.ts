import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  userName: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  file: Express.Multer.File;
}
