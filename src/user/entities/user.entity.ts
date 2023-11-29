import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Base } from 'src/utils/base';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends Base {
  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ default: '' })
  userName: string;

  @ApiProperty()
  @Column()
  @Exclude()
  password: string;

  @ApiProperty()
  @Column({ default: 'user' })
  role: string;

  //   @ApiProperty()
  //   @OneToMany(() => Wallet, (wallet) => wallet.user)
  //   wallet: Wallet[];

  //   @ApiProperty()
  //   @OneToMany(() => Expense, (expense) => expense.user)
  //   expense: Expense[];
}
