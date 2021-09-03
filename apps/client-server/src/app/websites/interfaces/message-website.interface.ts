import BaseWebsiteOptions from '../../submission/models/message-submission.model';
import PostData from '../../submission/models/post-data.model';
import Ctor from './constructor.interface';

export default interface MessageWebsite<T extends BaseWebsiteOptions> {
  messageModel: Ctor<T>;
  supportsMessage: true;

  createMessageModel(): T;

  onPostMessageSubmission(
    postData: PostData<T>,
    accountData: Record<string, unknown>,
    cancellationToken: unknown
  ): Promise<unknown>;

  onValidateMessageSubmission(
    postData: PostData<T>,
    accountData: Record<string, unknown>
  ): Promise<unknown>;
}
