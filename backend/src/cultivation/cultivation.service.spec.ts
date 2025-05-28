import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { CultivationService } from './cultivation.service';
import { Cultivation } from './entities/cultivation.entity';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { Farm } from '../farms/entities/farm.entity';
import { Season } from '../seasons/entities/season.entity';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const makeMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('CultivationService', () => {
  let service: CultivationService;
  let repo: MockRepo<Cultivation>;
  let farmRepo: MockRepo<Farm>;
  let seasonRepo: MockRepo<Season>;

  beforeEach(async () => {
    repo = makeMockRepo<Cultivation>();
    farmRepo = makeMockRepo<Farm>();
    seasonRepo = makeMockRepo<Season>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CultivationService,
        { provide: getRepositoryToken(Cultivation), useValue: repo },
        { provide: getRepositoryToken(Farm), useValue: farmRepo },
        { provide: getRepositoryToken(Season), useValue: seasonRepo },
      ],
    }).compile();

    service = module.get<CultivationService>(CultivationService);
  });

  describe('create', () => {
    it('should create when farm and season exist', async () => {
      const dto: CreateCultivationDto = {
        crop: 'Soja',
        farmId: 'f1',
        seasonId: 's1',
      };
      const farm = { id: 'f1' } as Farm;
      const season = { id: 's1' } as Season;
      const ent = { id: 'c1', crop: 'Soja', farm, season } as Cultivation;

      farmRepo.findOne!.mockResolvedValue(farm);
      seasonRepo.findOne!.mockResolvedValue(season);
      repo.create!.mockReturnValue(ent);
      repo.save!.mockResolvedValue(ent);

      const result = await service.create(dto);
      expect(farmRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.farmId },
      });
      expect(seasonRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.seasonId },
      });
      expect(repo.create).toHaveBeenCalledWith({
        crop: dto.crop,
        farm,
        season,
      });
      expect(repo.save).toHaveBeenCalledWith(ent);
      expect(result).toEqual(ent);
    });

    it('should throw when farm not found', async () => {
      farmRepo.findOne!.mockResolvedValue(undefined);
      await expect(
        service.create({ crop: 'X', farmId: 'f1', seasonId: 's1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when season not found', async () => {
      const farm = { id: 'f1' } as Farm;
      farmRepo.findOne!.mockResolvedValue(farm);
      seasonRepo.findOne!.mockResolvedValue(undefined);
      await expect(
        service.create({ crop: 'X', farmId: 'f1', seasonId: 's1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all cultivations', async () => {
      const arr = [{ id: 'c1' }] as Cultivation[];
      repo.find!.mockResolvedValue(arr);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ relations: ['farm', 'season'] });
      expect(result).toBe(arr);
    });
  });

  describe('findOne', () => {
    it('should return a cultivation when found', async () => {
      const ent = { id: 'c1' } as Cultivation;
      repo.findOne!.mockResolvedValue(ent);
      const result = await service.findOne('c1');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'c1' },
        relations: ['farm', 'season'],
      });
      expect(result).toBe(ent);
    });
    it('should throw if not found', async () => {
      repo.findOne!.mockResolvedValue(undefined);
      await expect(service.findOne('c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update crop', async () => {
      const existing = {
        id: 'c1',
        crop: 'A',
        farm: {} as Farm,
        season: {} as Season,
      } as Cultivation;
      const dto = { crop: 'B' } as UpdateCultivationDto;
      const updated = { ...existing, ...dto } as Cultivation;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      repo.save!.mockResolvedValue(updated);
      const result = await service.update('c1', dto);
      expect(service.findOne).toHaveBeenCalledWith('c1');
      expect(repo.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should change farm if farmId provided', async () => {
      const existing = {
        id: 'c1',
        crop: 'A',
        farm: { id: 'f1' } as Farm,
        season: { id: 's1' } as Season,
      } as Cultivation;
      const newFarm = { id: 'f2' } as Farm;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      farmRepo.findOne!.mockResolvedValue(newFarm);
      const dto = { farmId: 'f2' } as UpdateCultivationDto;
      await service.update('c1', dto);
      expect(farmRepo.findOne).toHaveBeenCalledWith({ where: { id: 'f2' } });
    });

    it('should throw if farm not found on update', async () => {
      const existing = {
        id: 'c1',
        crop: 'A',
        farm: { id: 'f1' } as Farm,
        season: { id: 's1' } as Season,
      } as Cultivation;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      farmRepo.findOne!.mockResolvedValue(undefined);
      await expect(
        service.update('c1', { farmId: 'f2' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should change season if seasonId provided', async () => {
      const existing = {
        id: 'c1',
        crop: 'A',
        farm: {} as Farm,
        season: { id: 's1' } as Season,
      } as Cultivation;
      const newSeason = { id: 's2' } as Season;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      seasonRepo.findOne!.mockResolvedValue(newSeason);
      await service.update('c1', { seasonId: 's2' } as any);
      expect(seasonRepo.findOne).toHaveBeenCalledWith({ where: { id: 's2' } });
    });

    it('should throw if season not found on update', async () => {
      const existing = {
        id: 'c1',
        crop: 'A',
        farm: {} as Farm,
        season: { id: 's1' } as Season,
      } as Cultivation;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      seasonRepo.findOne!.mockResolvedValue(undefined);
      await expect(
        service.update('c1', { seasonId: 's2' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove successfully', async () => {
      repo.delete!.mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('c1')).resolves.toBeUndefined();
    });

    it('should throw if nothing deleted', async () => {
      repo.delete!.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('c1')).rejects.toThrow(NotFoundException);
    });
  });
});
