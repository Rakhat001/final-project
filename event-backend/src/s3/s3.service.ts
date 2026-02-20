import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { Express } from 'express';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.bucketName = (this.configService.get<string>('AWS_BUCKET_NAME') ||
      this.configService.get<string>('S3_BUCKET_NAME')) as string;

    const accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') ||
      this.configService.get<string>('S3_ACESS_KEY');
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
      this.configService.get<string>('S3_SECRET_KEY');

    const endpoint =
      this.configService.get<string>('S3_ENDPOINT') ||
      this.configService.get<string>('S3_URL');
    const region = this.configService.get<string>('AWS_REGION') || 'kz-ala-1';

    if (!this.bucketName) {
      this.logger.error(
        'AWS_BUCKET_NAME or S3_BUCKET_NAME is not defined in .env',
      );
      throw new Error('Bucket name is missing from configuration');
    }
    if (!accessKeyId || !secretAccessKey || !endpoint) {
      this.logger.error('Missing S3 credentials or endpoint');
      throw new Error('S3 configuration is incomplete');
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const key = `${Date.now()}-${file.originalname}`;

    try {
      const useACL =
        this.configService.get<string>('S3_USE_ACL', 'true') === 'true';

      const commandParams: any = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      if (useACL) {
        commandParams.ACL = 'public-read';
      }

      await this.s3Client.send(new PutObjectCommand(commandParams));

      const endpoint =
        this.configService.get<string>('S3_ENDPOINT') ||
        this.configService.get<string>('S3_URL');
      if (!endpoint) {
        throw new Error('S3_ENDPOINT or S3_URL must be configured');
      }
      const distinctEndpoint = endpoint.startsWith('http')
        ? endpoint
        : `https://${endpoint}`;

      const url = `${distinctEndpoint}/${this.bucketName}/${key}`;
      this.logger.log(`File uploaded successfully: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
