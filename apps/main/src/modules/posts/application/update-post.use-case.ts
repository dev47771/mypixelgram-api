// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostInputDto } from '../api/input-dto/post.input.dto';
// import { PostsRepo } from '../infrastructure/post.repo';
//
// export class UpdatePostCommand {
//   constructor(
//     public dto: PostInputDto,
//     public postId: string,
//   ) {}
// }
// @CommandHandler(UpdatePostCommand)
// export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
//   constructor(private postRepo: PostsRepo) {}
//   async execute(post: UpdatePostCommand): Promise<void> {
//     await this.blogRepository.getBlogEntityOrNotFound(+post.blogId);
//     const postEntity = await this.postRepo.getByIdOrFail(post.postId);
//     const newPostDataForUpdate: UpdatePostInput = {
//       content: post.dto.content,
//       shortDescription: post.dto.shortDescription,
//       title: post.dto.title,
//     };
//     const updatedPost = postEntity.updatePost(newPostDataForUpdate);
//     await this.postRepo.savePost(updatedPost);
//   }
// }