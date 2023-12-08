import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { TMessage } from 'src/types/global-types';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class RecipeService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createRecipe(
    userId: number,
    createRecipeDto: CreateRecipeDto,
  ): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User does not exist.`);
      }

      const createRecipe = this.recipeRepository.create({
        title: createRecipeDto.title,
        titleImg: createRecipeDto.titleImg,
        description: createRecipeDto.description,
        ingredients: createRecipeDto.ingredients,
        stages: createRecipeDto.stages,
        user,
      });

      await queryRunner.manager.save(createRecipe);
      await queryRunner.commitTransaction();
      return { message: 'Recipe has been succesfully created' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new ConflictException('Error when creating new recipe');
    } finally {
      await queryRunner.release();
    }
  }
}
