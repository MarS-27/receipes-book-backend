import { ConflictException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

export const fileUploadInterceptor = AnyFilesInterceptor({
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new ConflictException(
          'Invalid file format. Please load only this format file: (png | jpg | jpeg | webp)',
        ),
        false,
      );
    }
  },
});
