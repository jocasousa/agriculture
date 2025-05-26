import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ProducersService } from './producers.service';
import { Producer } from './entities/producer.entity';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const makeMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ProducersService', () => {
  let service: ProducersService;
  let repo: MockRepo<Producer>;

  beforeEach(async () => {
    repo = makeMockRepo<Producer>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducersService,
        { provide: getRepositoryToken(Producer), useValue: repo },
      ],
    }).compile();

    service = module.get<ProducersService>(ProducersService);
  });

  describe('create', () => {
    it('should create and return a new producer', async () => {
      const dto: CreateProducerDto = { document: '12345678901', name: 'Teste' };
      const created = { id: '1', ...dto };

      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(dto);
      repo.save!.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { document: dto.document },
      });
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException on duplicate document', async () => {
      const dto: CreateProducerDto = { document: '123', name: 'A' };
      repo.findOne!.mockResolvedValue({} as any);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of producers', async () => {
      const fakeList = [{ id: '1', document: '123', name: 'A' }] as Producer[];
      repo.find!.mockResolvedValue(fakeList);

      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(result).toBe(fakeList);
    });
  });

  describe('findOne', () => {
    it('should return a single producer when found', async () => {
      const fake = { id: '1', document: '123', name: 'A' } as Producer;
      repo.findOne!.mockResolvedValue(fake);

      const result = await service.findOne('1');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(fake);
    });

    it('should throw NotFoundException when producer not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated producer', async () => {
      const dto: UpdateProducerDto = { name: 'Novo Nome' };
      const existing = { id: '1', document: '123', name: 'Antigo' } as Producer;
      const updated = { ...existing, ...dto };

      repo.update!.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(updated);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('1', dto);
      expect(repo.update).toHaveBeenCalledWith('1', dto);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if update does not affect any rows', async () => {
      const dto: UpdateProducerDto = { name: 'Teste' };
      repo.update!.mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.update('1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete successfully', async () => {
      repo.delete!.mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if delete does not affect any rows', async () => {
      repo.delete!.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
