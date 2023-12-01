import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
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

  @ApiProperty({ description: 'User role (admin or user)' })
  @Column({ default: 'user' })
  role: string;

  //   @ApiProperty()
  //   @OneToMany(() => Wallet, (wallet) => wallet.user)
  //   wallet: Wallet[];

  //   @ApiProperty()
  //   @OneToMany(() => Expense, (expense) => expense.user)
  //   expense: Expense[];
}
