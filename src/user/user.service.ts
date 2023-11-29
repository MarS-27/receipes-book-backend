import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/auth/dto/registration-user.dto';
import { TToken } from 'src/types/global-types';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  async getUserData(userId: number): Promise<User> {
    const userData = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!userData) {
      throw new NotFoundException(`Current user does not exist.`);
    }
    return instanceToPlain(userData) as User;
  }
}
