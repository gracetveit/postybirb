import { TestMetadata } from '@postybirb/website-metadata';
import { Class } from 'type-fest';
import FileWebsiteOptions from '../../../submission/models/file-website-options.model';
import PostData from '../../../submission/models/post-data.model';
import { FileWebsite } from '../../models/website-modifier-interfaces/file-website.interface';
import { ILoginState } from '../../models/login-state.interface';
import { MessageWebsite } from '../../models/website-modifier-interfaces/message-website.interface';
import { OAuthWebsite } from '../../models/website-modifier-interfaces/oauth-website.interface';
import { Website } from '../../website';
import { WebsiteMetadata } from '../../website-metadata.decorator';
import { TestFileSubmission } from './models/test-file-submission.model';
import { TestMessageSubmission } from './models/test-message-submission.model';
import { UserLoginWebsite } from '../../models/website-modifier-interfaces/user-login-website.interface';
import { FileSubmission } from '../../../submission/models/file-submission.model';
import { MessageSubmission } from '../../../submission/models/message-submission.model';

@WebsiteMetadata(TestMetadata)
export default class TestWebsite
  extends Website<{ test: string }>
  implements
    FileWebsite<TestFileSubmission>,
    MessageWebsite<TestMessageSubmission>,
    OAuthWebsite,
    UserLoginWebsite
{
  FileModel: Class<TestFileSubmission> = TestFileSubmission;

  MessageModel: Class<TestMessageSubmission> = TestMessageSubmission;

  supportsAdditionalFiles = false;

  supportsFile: true = true;

  supportsMessage: true = true;

  public externallyAccessibleWebsiteDataProperties: { test: boolean } = {
    test: true,
  };

  protected BASE_URL = 'http://localhost:3000';

  loginUrl: string = `${this.BASE_URL}/login`;

  public async onLogin(): Promise<ILoginState> {
    if (this.account.id === 'FAIL') {
      this.loginState.logout();
    }

    await this.websiteDataStore.setData({ test: 'test-mode' });
    return this.loginState.setLogin(true, 'TestUser');
  }

  createFileModel(): TestFileSubmission {
    return new this.FileModel();
  }

  createMessageModel(): TestMessageSubmission {
    return new this.MessageModel();
  }

  onPostFileSubmission(
    postData: PostData<FileWebsiteOptions>,
    cancellationToken: unknown
  ): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  onValidateFileSubmission(
    submissionData: FileSubmission,
    postData: PostData<TestFileSubmission>
  ): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  onPostMessageSubmission(
    postData: PostData<TestMessageSubmission>,
    cancellationToken: unknown
  ): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  onValidateMessageSubmission(
    submissionData: MessageSubmission,
    postData: PostData<TestMessageSubmission>
  ): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  async onAuthorize(
    data: Record<string, unknown>,
    state: string
  ): Promise<Record<string, boolean>> {
    if (state === 'authorize') {
      return { result: true };
    }

    return { result: false };
  }
}
