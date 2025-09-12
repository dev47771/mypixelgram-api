import { Test, TestingModule } from '@nestjs/testing';
import { FilesApiController } from './files-api.controller';
import { FilesApiService } from './files-api.service';

describe('FilesApiController', () => {
  let filesApiController: FilesApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FilesApiController],
      providers: [FilesApiService],
    }).compile();

    filesApiController = app.get<FilesApiController>(FilesApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(filesApiController.getHello()).toBe('Hello World!');
    });
  });
});
