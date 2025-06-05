import { DatabaseService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class NotificationsService {
  constructor(public dbService: DatabaseService) {}

  async uploadFile(fileBuffer: Buffer, filename: string, sub: string) {
    console.log(sub);
    const bucketName = process.env.BUCKET_NAME;
    const fileDestination = process.env.UPLOADED_FILES_DESTINATION;

    try {
      const s3 = new S3();
      const fileUploaded = await s3
        .upload({
          Bucket: bucketName,
          Key: `${fileDestination}/${filename}`,
          Body: fileBuffer,
        })
        .promise();

      return fileUploaded.Location;
    } catch (error) {
      throw new Error(error);
    }
  }
}
