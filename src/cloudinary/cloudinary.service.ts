import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

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
    fileBuffer: Buffer,
    fileFolder: 'user-images' | 'recipe-images',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: fileFolder, format: 'png' },
          (err, callResult) => {
            err ? reject(err) : resolve(callResult);
          },
        )
        .end(fileBuffer);
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
