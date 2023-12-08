import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { TMessage } from 'src/types/global-types';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUDNAME,
      api_key: process.env.CLOUDINARY_APIKEY,
      api_secret: process.env.CLOUDINARY_APISECRET,
    });
  }

  async uploadImages(
    filesBuffer: Buffer[],
    fileFolder: 'user-images' | 'recipe-images',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: fileFolder },
        (err, callResult) => {
          err ? reject(err) : resolve(callResult);
        },
      );

      filesBuffer.forEach((fileBuffer) => {
        uploadStream.write(fileBuffer);
      });

      uploadStream.end();
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (err, callResult) => {
        err ? reject(err) : resolve(callResult);
      });
    });
  }

  async deleteImages(publicIds: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.delete_resources(publicIds, (err, callResult) => {
        err ? reject(err) : resolve(callResult);
      });
    });
  }
}

// https://res.cloudinary.com/dc6v1ldtx/recipe-images/peatzskzjs6cyezperkx
