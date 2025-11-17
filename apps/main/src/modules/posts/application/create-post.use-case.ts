import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInputDto } from '../api/input-dto/post.input.dto';
import { PostsRepo } from '../infrastructure/post.repo';
import { BadRequestDomainException } from '../../../core/exceptions/domain/domainException';
import { TransportService } from '../../transport/transport.service';

export class CreatePostCommand {
  constructor(
    public dto: CreateInputDto,
    public userId: string,
  ) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, string> {
  constructor(
    private postRepo: PostsRepo,
    private transportService: TransportService,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    try {
      const payload = { filesId: command.dto.filesId, userId: command.userId };
      await this.transportService.verifyFileOwnership(payload);
    } catch (error) {
      throw BadRequestDomainException.create(error.message, 'CheckFileIdOwnerUseCase IN FILES_API MICROSERVICE');
    }
    return await this.postRepo.createPost({
      location: command.dto.location,
      description: command.dto.description,
      fileIds: command.dto.filesId,
      userId: command.userId,
    });
  }
}
