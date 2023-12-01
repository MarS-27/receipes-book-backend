import { ApiProperty } from '@nestjs/swagger';
import { Base } from 'src/utils/base';
import { Column, Entity } from 'typeorm';

@Entity()
export class ImageFile extends Base {
  @ApiProperty()
  @Column({ nullable: false })
  file_path: string;

  @ApiProperty()
  @Column({ nullable: false })
  file_originalName: string;

  @ApiProperty()
  @Column({ nullable: false })
  file_contentType: string;
}
