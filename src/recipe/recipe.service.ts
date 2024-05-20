import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  PaginatedResult,
  RecipeCategories,
  TMessage,
} from 'src/types/global-types';
import { User } from 'src/user/entities/user.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
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
          category: createRecipeDto.category,
          titleImgPath,
          description: createRecipeDto.description,
          isVegan: createRecipeDto.isVegan,
          ingredients: createRecipeDto.ingredients,
          stages,
          user,
        });
      } else {
        await queryRunner.manager.save(Recipe, {
          title: createRecipeDto.title,
          category: createRecipeDto.category,
          titleImgPath: createRecipeDto.titleImgPath,
          description: createRecipeDto.description,
          isVegan: createRecipeDto.isVegan,
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
    category: RecipeCategories,
    limit: number,
    skip: number,
    isVegan: boolean,
  ): Promise<PaginatedResult<Recipe>> {
    try {
      const ModifIsVegan = isVegan ? isVegan : undefined;

      const whereClause =
        category !== RecipeCategories.All
          ? {
              user: { id: userId },
              category,
              isVegan: ModifIsVegan,
            }
          : { user: { id: userId }, isVegan: ModifIsVegan };

      const total = await this.recipeRepository.count({
        where: whereClause,
      });

      const results = await this.recipeRepository.find({
        where: whereClause,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        total,
        skip,
        limit,
        results,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error when getting recipes: ${error?.message}`,
      );
    }
  }

  async searchRecipes(userId: number, query: string): Promise<Recipe[]> {
    try {
      const whereClause = {
        user: { id: userId },
        title: ILike(`%${query.trim().replace(/\s+/g, ' ')}%`),
      };

      const recipes = await this.recipeRepository.find({ where: whereClause });

      return recipes;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred when searching recipes.',
      );
    }
  }

  async updateRecipeData(
    userId: number,
    recipeId: number,
    updateRecipeDto: UpdateRecipeDto,
    files: Express.Multer.File[],
  ): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    let { titleImgPath, stages, ...otherData } = updateRecipeDto;

    const whereClause = { user: { id: userId }, id: recipeId };
    const recipe = await this.recipeRepository.findOne({ where: whereClause });

    if (!recipe) {
      throw new NotFoundException('Recipe not found.');
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newImgPaths = [];
    let oldImgPaths = [];

    try {
      if (files.length) {
        const uploadRes = await Promise.all(
          files.map((file) =>
            this.cloudinaryService.uploadImages(file.buffer, 'recipe-images'),
          ),
        );

        let imgCount = 0;

        newImgPaths = uploadRes.map((img) => img.public_id);

        if (titleImgPath !== recipe.titleImgPath) {
          if (titleImgPath) {
            titleImgPath = uploadRes[imgCount].public_id;

            imgCount++;
          }

          if (recipe.titleImgPath) {
            oldImgPaths.push(recipe.titleImgPath);
          }
        }

        if (stages.length) {
          stages.forEach((stage) => {
            const stageInDb = recipe.stages.find(
              (oldStage) => oldStage.stageNumber === stage.stageNumber,
            );

            if (stage.imgPath) {
              if (stageInDb && stage.imgPath === stageInDb.imgPath) {
                return;
              }

              if (stageInDb?.imgPath) {
                oldImgPaths.push(stageInDb.imgPath);
              }

              stage.imgPath = uploadRes[imgCount].public_id;
              imgCount++;
            }
          });
        }

        await queryRunner.manager.update(Recipe, recipeId, {
          titleImgPath,
          stages,
          ...otherData,
        });

        if (oldImgPaths.length) {
          await this.cloudinaryService.deleteImages(oldImgPaths);
        }
      } else {
        if (recipe.titleImgPath && !titleImgPath) {
          oldImgPaths.push(recipe.titleImgPath);
        }

        if (stages.length) {
          stages.forEach((stage) => {
            const stageInDb = recipe.stages.find(
              (oldStage) => oldStage.stageNumber === stage.stageNumber,
            );

            if (!stage.imgPath && stageInDb?.imgPath) {
              oldImgPaths.push(stageInDb.imgPath);
            }
          });
        }

        await queryRunner.manager.update(Recipe, recipeId, {
          titleImgPath,
          stages,
          ...otherData,
        });

        if (oldImgPaths.length) {
          await this.cloudinaryService.deleteImages(oldImgPaths);
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Recipe has been successfully updated.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (files.length) {
        await this.cloudinaryService.deleteImages(newImgPaths);
      }

      throw new InternalServerErrorException(
        'An error occurred when updating recipe.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRecipe(userId: number, recipeId: number): Promise<TMessage> {
    const queryRunner = this.dataSource.createQueryRunner();

    const whereClause = { user: { id: userId }, id: recipeId };
    const recipe = await this.recipeRepository.findOne({ where: whereClause });

    if (!recipe) {
      throw new NotFoundException('Recipe not found.');
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const allImgPaths = recipe.titleImgPath ? [recipe.titleImgPath] : [];

      recipe.stages.forEach((stage) => {
        if (stage.imgPath) {
          allImgPaths.push(stage.imgPath);
        }
      });

      await queryRunner.manager.delete(Recipe, recipeId);

      if (allImgPaths.length) {
        await this.cloudinaryService.deleteImages(allImgPaths);
      }

      await queryRunner.commitTransaction();
      return { message: 'Product has been deleted' };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'An error occurred when deleting recipe.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
