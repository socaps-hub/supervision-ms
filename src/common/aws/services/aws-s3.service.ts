import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { FileUpload } from 'graphql-upload-ts';
import { envs } from 'src/config';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger('AwsS3Service');
  private readonly s3: S3Client;
  private readonly bucket = envs.awsS3BucketName;

  constructor() {
    this.s3 = new S3Client({
      region: envs.awsS3Region,
      credentials: {
        accessKeyId: envs.awsAccessKeyId,
        secretAccessKey: envs.awsSecretAccessKey,
      }
    })
  }

  // aws-s3.service.ts
  async uploadExcel(file: FileUpload, folder = 'radiografias') {
    const { createReadStream, filename, mimetype } = file;
    const key = `${folder}/${uuid()}-${filename}`;

    const stream = createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ContentLength: buffer.length,
      }),
    );

    const url = `https://${this.bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return { key, url };
  }

  async uploadBuffer(params: {
    buffer: Buffer;
    key: string;
    contentType: string;
  }) {
    const { buffer, key, contentType } = params;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      }),
    );

    const url = `https://${this.bucket}.s3.${envs.awsS3Region}.amazonaws.com/${key}`;

    return { key, url };
  }

  async getSignedDownloadUrl(params: {
    key: string;
    expiresInSeconds?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: params.expiresInSeconds ?? 60 * 10, // 10 minutos
    });

    return url;
  }

}
