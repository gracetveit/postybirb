import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Log, Logger } from '@postybirb/logger';
import { Express } from 'express';
import 'multer';
import { DeleteResult, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AccountService } from '../../account/account.service';
import { SUBMISSION_REPOSITORY } from '../../constants';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';
import { UpdateSubmissionDto } from '../dtos/update-submission.dto';
import { Submission } from '../entities/submission.entity';
import { ScheduleType } from '../enums/schedule-type.enum';
import SubmissionType from '../enums/submission-type.enum';
import {
  FileSubmission,
  isFileSubmission,
} from '../models/file-submission.model';
import { MessageSubmission } from '../models/message-submission.model';
import { SubmissionMetadataType } from '../models/submission-metadata-types.model';
import { FileSubmissionService } from './file-submission.service';
import { MessageSubmissionService } from './message-submission.service';
import { SubmissionPartService } from './submission-part.service';

@Injectable()
export class SubmissionService {
  private readonly logger = Logger(SubmissionService.name);

  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: Repository<
      Submission<SubmissionMetadataType>
    >,
    private readonly accountService: AccountService,
    private readonly submissionPartService: SubmissionPartService,
    private readonly fileSubmissionService: FileSubmissionService,
    private readonly messageSubmissionService: MessageSubmissionService
  ) {}

  /**
   * Creates a submission.
   * @todo need to make transactional
   *
   * @param {CreateSubmissionDto} createSubmissionDto
   * @param {Express.Multer.File} [file]
   * @return {*}  {Promise<Submission<SubmissionMetadataType>>}
   */
  @Log()
  async create(
    createSubmissionDto: CreateSubmissionDto,
    file?: Express.Multer.File
  ): Promise<Submission<SubmissionMetadataType>> {
    let submission = this.submissionRepository.create({
      id: uuid(),
      ...createSubmissionDto,
      isScheduled: false,
      schedule: {
        scheduledFor: undefined,
        scheduleType: ScheduleType.SINGLE,
      },
      parts: [],
      metadata: {},
    });

    switch (createSubmissionDto.type) {
      case SubmissionType.MESSAGE: {
        if (file) {
          throw new BadRequestException(
            'A file was provided for SubmissionType Message.'
          );
        }

        await this.messageSubmissionService.populate(
          submission as MessageSubmission,
          createSubmissionDto
        );
        break;
      }

      case SubmissionType.FILE: {
        if (!file) {
          throw new BadRequestException(
            'No file provided for SubmissionType FILE.'
          );
        }

        await this.fileSubmissionService.populate(
          submission as FileSubmission,
          createSubmissionDto,
          file
        );
        break;
      }

      default: {
        throw new BadRequestException(
          `Unknown SubmissionType: ${createSubmissionDto.type}.`
        );
      }
    }

    submission.parts.push(
      this.submissionPartService.createDefaultSubmissionPart(submission)
    );

    return await this.submissionRepository.save(submission);
  }

  /**
   * Find a Submission matching the Id provided.
   *
   * @param {string} id
   * @return {*}  {Promise<Submission<SafeObject>>}
   */
  async findOne(id: string): Promise<Submission<any>> {
    try {
      return await this.submissionRepository.findOneOrFail(id);
    } catch (e) {
      this.logger.error(e);
      throw new NotFoundException(id);
    }
  }

  /**
   * Update a Submission matching the Id provided.
   *
   * @param {string} id
   * @param {UpdateSubmissionDto} updateSubmissionDto
   * @return {*}  {Promise<boolean>}
   */
  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto
  ): Promise<boolean> {
    const submission = await this.findOne(id);

    submission.isScheduled = updateSubmissionDto.isSchduled;
    submission.schedule = {
      scheduledFor: updateSubmissionDto.scheduledFor,
      scheduleType: updateSubmissionDto.scheduleType,
    };

    return await this.submissionRepository
      .save(submission)
      .then(() => true)
      .catch((err) => {
        throw new BadRequestException(err);
      });
  }

  /**
   * Deleted a Submission matching the Id provided.
   *
   * @param {string} id
   * @return {*}  {Promise<DeleteResult>}
   */
  @Log()
  async remove(id: string): Promise<DeleteResult> {
    const submission = await this.findOne(id);

    if (isFileSubmission(submission)) {
      await this.fileSubmissionService.remove(submission);
    }

    return await this.submissionRepository.delete(id).then((result) => {
      return result;
    });
  }
}
