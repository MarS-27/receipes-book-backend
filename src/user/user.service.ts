import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/auth/dto/registration-user.dto';
import { TMessage, TToken } from 'src/types/global-types';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async userRegistration(registerUserDto: RegisterUserDto): Promise<TToken> {
    const isExistUser = await this.userRepository.findOne({
      where: {
        email: registerUserDto.email,
      },
    });

    if (isExistUser) {
      throw new BadRequestException('This email is already existed!');
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);
      const newUser = this.userRepository.create({
        email: registerUserDto.email,
        password: hashedPassword,
      });

      await this.userRepository.save(newUser);
      const token = this.jwtService.sign({ email: registerUserDto.email });

      return { token };
    } catch (err) {
      throw new InternalServerErrorException(
        'An error occurred when saving the new User.',
      );
    }
  }

  async updateUserData(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    const userProfile = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userProfile) {
      throw new NotFoundException(`User does not exist.`);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(User, userId, { ...updateUserDto });

      await queryRunner.commitTransaction();
      return { message: 'User profile has been successfully updated.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'An error occurred when updating the user.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
