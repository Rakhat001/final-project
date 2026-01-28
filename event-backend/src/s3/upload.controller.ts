import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const url = await this.s3Service.uploadFile(file);
      return { url };
    } catch (error) {
      throw new BadRequestException(error.message || 'File upload failed');
    }
  }
}
