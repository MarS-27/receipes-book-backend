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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
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
    file: Express.Multer.File,
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

    let newImagePath = '';

    try {
      if (file) {
        const uploadRes = await this.cloudinaryService.uploadImages(
          file.buffer,
          'user-images',
        );

        newImagePath = uploadRes.public_id;

        await queryRunner.manager.update(User, userId, {
          imgPath: newImagePath,
          ...updateUserDto,
        });

        if (userProfile.imgPath) {
          await this.cloudinaryService.deleteImages([userProfile.imgPath]);
        }
      } else {
        await queryRunner.manager.update(User, userId, updateUserDto);
      }

      await queryRunner.commitTransaction();
      return { message: 'User profile has been successfully updated.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (file) {
        await this.cloudinaryService.deleteImages([newImagePath]);
      }

      throw new InternalServerErrorException(
        'An error occurred when updating user.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUserProfile(userId: number): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['recipes'],
    });

    if (!user) {
      throw new NotFoundException(`User does not exist.`);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const allImgPaths = user.imgPath ? [user.imgPath] : [];

      user.recipes.forEach((recipe) => {
        if (recipe.titleImgPath) {
          allImgPaths.push(recipe.titleImgPath);
        }

        recipe.stages.forEach((stage) => {
          if (stage.imgPath) {
            allImgPaths.push(stage.imgPath);
          }
        });
      });

      await queryRunner.manager.delete(User, userId);

      if (allImgPaths.length) {
        await this.cloudinaryService.deleteImages(allImgPaths);
      }

      await queryRunner.commitTransaction();
      return { message: 'User has been deleted.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'An error occurred when deleting user.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
