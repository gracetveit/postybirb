import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PostyBirbDirectories } from '@postybirb/fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AccountModule } from '../account/account.module';
import { DatabaseModule } from '../database/database.module';
import { FileModule } from '../file/file.module';
import { SubmissionOptionsModule } from '../submission-options/submission-options.module';
import { WebsitesModule } from '../websites/websites.module';
import { FileSubmissionService } from './services/file-submission.service';
import { MessageSubmissionService } from './services/message-submission.service';
import { SubmissionService } from './services/submission.service';
import { SubmissionController } from './submission.controller';

@Module({
  imports: [
    DatabaseModule,
    WebsitesModule,
    AccountModule,
    FileModule,
    forwardRef(() => SubmissionOptionsModule),
    MulterModule.register({
      limits: {
        fileSize: 3e8, // Max 300MB
      },
      storage: diskStorage({
        destination(req, file, cb) {
          cb(null, PostyBirbDirectories.TEMP_DIRECTORY);
        },
        filename(req, file, cb) {
          cb(null, Date.now() + extname(file.originalname)); // Appending extension
        },
      }),
    }),
  ],
  providers: [
    SubmissionService,
    MessageSubmissionService,
    FileSubmissionService,
  ],
  controllers: [SubmissionController],
  exports: [SubmissionService],
})
export class SubmissionModule {}
