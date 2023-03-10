import { BadRequestException, Injectable } from '@nestjs/common';
import { FileSubmission } from '@postybirb/types';
import { FileService } from '../../file/file.service';
import { MulterFileInfo } from '../../file/models/multer-file-info';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';
import { ISubmissionService } from './submission-service';

/**
 * Service that implements logic for manipulating a FileSubmission.
 * All actions perform mutations on the original object.
 *
 * @class FileSubmissionService
 * @implements {ISubmissionService<FileSubmission>}
 */
@Injectable()
export class FileSubmissionService
  implements ISubmissionService<FileSubmission>
{
  constructor(private readonly fileService: FileService) {}

  async populate(
    submission: FileSubmission,
    createSubmissionDto: CreateSubmissionDto,
    file: MulterFileInfo
  ): Promise<void> {
    // eslint-disable-next-line no-param-reassign
    submission.metadata = {
      ...submission.metadata,
      order: [],
    };

    await this.appendFile(submission, file);
  }

  async remove(submission: FileSubmission) {
    // Nothing yet
  }

  async appendFile(
    submission: FileSubmission,
    file: MulterFileInfo,
    append = true
  ) {
    const createdFile = await this.fileService.create(file, submission);
    submission.files.add(createdFile);
    if (append) {
      submission.metadata.order.push(createdFile.id);
    }
    return createdFile;
  }

  async replaceThumbnailFile(fileId: string, file: MulterFileInfo) {
    return this.fileService.replaceFileThumbnail(fileId, file);
  }

  async removeFile(submission: FileSubmission, fileId: string) {
    await this.fileService.remove(fileId);
    // eslint-disable-next-line no-param-reassign
    submission.metadata.order = submission.metadata.order.filter(
      (id) => id !== fileId
    );
  }

  async replaceFile(
    submission: FileSubmission,
    fileId: string,
    file: MulterFileInfo
  ) {
    if (!submission.metadata.order.some((id) => id === fileId)) {
      throw new BadRequestException('File not found on submission');
    }

    await this.removeFile(submission, fileId);
    const newFile = await this.appendFile(submission, file, false);
    const replaceIndex = submission.metadata.order.findIndex(
      (id) => id === fileId
    );

    if (replaceIndex > -1) {
      // eslint-disable-next-line no-param-reassign
      submission.metadata.order[replaceIndex] = newFile.id;
    }

    return newFile;
  }
}
