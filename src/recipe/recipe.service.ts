import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginatedResult, TMessage } from 'src/types/global-types';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './entities/recipe.entity';

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
    files: Express.Multer.File[],
  ): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User does not exist.`);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newImagesPath = [];

    try {
      if (files.length) {
        const uploadRes = await Promise.all(
          files.map((file) =>
            this.cloudinaryService.uploadImages(file.buffer, 'recipe-images'),
          ),
        );

        let imgCount = 0;
        let titleImgPath = createRecipeDto.titleImgPath;
        newImagesPath = uploadRes.map((img) => img.public_id);

        if (createRecipeDto.titleImgPath) {
          titleImgPath = uploadRes[imgCount].public_id;
          imgCount++;
        }

        const stages = createRecipeDto.stages.map((stage) => {
          if (stage.imgPath) {
            stage.imgPath = uploadRes[imgCount].public_id;
            imgCount++;
          }

          return stage;
        });

        await queryRunner.manager.save(Recipe, {
          title: createRecipeDto.title,
          titleImgPath,
          description: createRecipeDto.description,
          ingredients: createRecipeDto.ingredients,
          stages,
          user,
        });
      } else {
        await queryRunner.manager.save(Recipe, {
          title: createRecipeDto.title,
          titleImgPath: createRecipeDto.titleImgPath,
          description: createRecipeDto.description,
          ingredients: createRecipeDto.ingredients,
          stages: createRecipeDto.stages,
          user,
        });
      }

      await queryRunner.commitTransaction();
      return { message: 'Recipe has been succesfully created.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (files.length) {
        await this.cloudinaryService.deleteImages(newImagesPath);
      }

      throw new InternalServerErrorException('Error when creating new recipe.');
    } finally {
      await queryRunner.release();
    }
  }

  async getRecipeById(userId: number, recipeId: number): Promise<Recipe> {
    const whereClause = { user: { id: userId }, id: recipeId };

    const recipe = await this.recipeRepository.findOne({
      where: whereClause,
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe not found.`);
    }

    return recipe;
  }

  async getPaginatedRecipes(
    userId: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedResult<Recipe>> {
    const whereClause = { user: { id: userId } };

    const total = await this.recipeRepository.count({
      where: whereClause,
    });

    const results = await this.recipeRepository.find({
      skip,
      take: limit,
      where: whereClause,
    });

    return {
      total,
      skip,
      limit,
      results,
    };
  }
}
