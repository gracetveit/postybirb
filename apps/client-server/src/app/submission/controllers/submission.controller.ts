import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MulterFileInfo } from '../../file/models/multer-file-info';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';
import { UpdateSubmissionDto } from '../dtos/update-submission.dto';
import { SubmissionService } from '../services/submission.service';

/**
 * CRUD operations on Submission data.
 *
 * @class SubmissionController
 */
@ApiTags('submission')
@Controller('submission')
export class SubmissionController {
  constructor(private readonly service: SubmissionService) {}

  @Get(':id')
  @ApiOkResponse({ description: 'The requested Submission.' })
  @ApiNotFoundResponse({ description: 'Submission not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Submission created.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  @UseInterceptors(FilesInterceptor('files', undefined, { preservePath: true }))
  async create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @UploadedFiles() files: MulterFileInfo[]
  ) {
    if (files.length) {
      const results = await Promise.allSettled(
        files.map((file, index) => {
          const createFileSubmission = new CreateSubmissionDto();
          Object.assign(createFileSubmission, createSubmissionDto);
          if (!createSubmissionDto.name) {
            createFileSubmission.name = file.originalname;
          } else {
            createFileSubmission.name = `${createSubmissionDto.name} - ${index}`;
          }

          return this.service.create(createFileSubmission, file);
        })
      );

      return results;
    }
    return Promise.allSettled([await this.service.create(createSubmissionDto)]);
  }

  @Post('file/add/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'File appended.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  @UseInterceptors(FilesInterceptor('file', undefined, { preservePath: true }))
  async appendFile(
    @Param('id') id: string,
    @UploadedFile() file: MulterFileInfo
  ) {
    return this.service.appendFile(id, file);
  }

  @Post('file/replace/:id/:fileId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'File replaced.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  @UseInterceptors(FilesInterceptor('file', undefined, { preservePath: true }))
  async replaceFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @UploadedFile() file: MulterFileInfo
  ) {
    return this.service.replaceFile(id, fileId, file);
  }

  @Post('thumbnail/add/:id/:fileId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Thumbnail file appended.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  @UseInterceptors(FilesInterceptor('file', undefined, { preservePath: true }))
  async appendThumbnail(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @UploadedFile() file: MulterFileInfo
  ) {
    return this.service.appendThumbnail(id, fileId, file);
  }

  @Post('thumbnail/append/:id/:fileId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Thumbnail file replaced.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  @UseInterceptors(FilesInterceptor('file', undefined, { preservePath: true }))
  async replaceThumbnail(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @UploadedFile() file: MulterFileInfo
  ) {
    return this.service.replaceThumbnail(id, fileId, file);
  }

  @Delete('file/remove/:id/:fileId')
  @ApiOkResponse({ description: 'File removed.' })
  @ApiBadRequestResponse({ description: 'Bad request made.' })
  async removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.service.removeFile(id, fileId);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Submission updated.', type: Boolean })
  @ApiNotFoundResponse({ description: 'Submission Id not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto
  ) {
    return this.service.update(id, updateSubmissionDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Submission deleted successfully.',
    type: Boolean,
  })
  @ApiNotFoundResponse({ description: 'Submission Id not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
