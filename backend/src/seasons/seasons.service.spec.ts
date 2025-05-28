import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { SeasonsService } from './seasons.service';
import { Season } from './entities/season.entity';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

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

describe('SeasonsService', () => {
  let service: SeasonsService;
  let repo: MockRepo<Season>;

  beforeEach(async () => {
    repo = makeMockRepo<Season>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonsService,
        { provide: getRepositoryToken(Season), useValue: repo },
      ],
    }).compile();

    service = module.get<SeasonsService>(SeasonsService);
  });

  describe('create', () => {
    it('should create and return a season', async () => {
      const dto: CreateSeasonDto = { year: 2025 };
      const entity = { id: '1', ...dto } as Season;
      repo.create!.mockReturnValue(dto);
      repo.save!.mockResolvedValue(entity);

      const result = await service.create(dto);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('should return an array of seasons', async () => {
      const seasons = [{ id: '1', year: 2025 }] as Season[];
      repo.find!.mockResolvedValue(seasons);

      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ relations: ['cultivations'] });
      expect(result).toBe(seasons);
    });
  });

  describe('findOne', () => {
    it('should return a season when found', async () => {
      const season = { id: '1', year: 2025 } as Season;
      repo.findOne!.mockResolvedValue(season);

      const result = await service.findOne('1');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivations'],
      });
      expect(result).toBe(season);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated season', async () => {
      const dto: UpdateSeasonDto = { year: 2030 };
      const existing = { id: '1', year: 2025 } as Season;
      const updated = { ...existing, ...dto } as Season;

      repo.update!.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(updated);

      const result = await service.update('1', dto);
      expect(repo.update).toHaveBeenCalledWith('1', dto);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if update affects no rows', async () => {
      repo.update!.mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.update('1', {} as UpdateSeasonDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete successfully', async () => {
      repo.delete!.mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if delete affects no rows', async () => {
      repo.delete!.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
