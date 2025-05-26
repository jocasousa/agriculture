import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { FarmsService } from './farms.service';
import { Farm } from './entities/farm.entity';
import { Producer } from '../producers/entities/producer.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';

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

describe('FarmsService', () => {
  let service: FarmsService;
  let farmRepo: MockRepo<Farm>;
  let producerRepo: MockRepo<Producer>;

  beforeEach(async () => {
    farmRepo = makeMockRepo<Farm>();
    producerRepo = makeMockRepo<Producer>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmsService,
        { provide: getRepositoryToken(Farm), useValue: farmRepo },
        { provide: getRepositoryToken(Producer), useValue: producerRepo },
      ],
    }).compile();

    service = module.get<FarmsService>(FarmsService);
  });

  describe('create', () => {
    it('should create and return a farm when valid', async () => {
      const dto: CreateFarmDto = {
        name: 'Fazenda A',
        city: 'Cidade',
        state: 'ST',
        totalArea: 100,
        arableArea: 60,
        vegetationArea: 40,
        producerId: 'prod-1',
      };
      const producer = { id: 'prod-1' } as Producer;
      const now = new Date();
      const farmEntity = {
        id: 'farm-1',
        name: dto.name,
        city: dto.city,
        state: dto.state,
        totalArea: dto.totalArea,
        arableArea: dto.arableArea,
        vegetationArea: dto.vegetationArea,
        producer,
        createdAt: now,
        updatedAt: now,
        cultivations: [],
      } as Farm;

      producerRepo.findOne!.mockResolvedValue(producer);
      farmRepo.create!.mockReturnValue(farmEntity);
      farmRepo.save!.mockResolvedValue(farmEntity);

      const result = await service.create(dto);

      expect(producerRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.producerId },
      });
      expect(farmRepo.create).toHaveBeenCalledWith({
        name: dto.name,
        city: dto.city,
        state: dto.state,
        totalArea: dto.totalArea,
        arableArea: dto.arableArea,
        vegetationArea: dto.vegetationArea,
        producer,
      });
      expect(farmRepo.save).toHaveBeenCalledWith(farmEntity);
      expect(result).toEqual(farmEntity);
    });

    it('should throw BadRequestException if areas exceed totalArea', async () => {
      const dto: CreateFarmDto = {
        name: 'Fazenda B',
        city: 'C',
        state: 'ST',
        totalArea: 50,
        arableArea: 30,
        vegetationArea: 30,
        producerId: 'prod-1',
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if producer not found', async () => {
      const dto: CreateFarmDto = {
        name: 'Fazenda C',
        city: 'C',
        state: 'ST',
        totalArea: 100,
        arableArea: 50,
        vegetationArea: 50,
        producerId: 'unknown',
      };
      producerRepo.findOne!.mockResolvedValue(undefined);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of farms', async () => {
      const farms = [{ id: '1' }] as Farm[];
      farmRepo.find!.mockResolvedValue(farms);

      const result = await service.findAll();
      expect(farmRepo.find).toHaveBeenCalledWith({ relations: ['producer'] });
      expect(result).toBe(farms);
    });
  });

  describe('findOne', () => {
    it('should return a farm when found', async () => {
      const farm = { id: '1' } as Farm;
      farmRepo.findOne!.mockResolvedValue(farm);

      const result = await service.findOne('1');
      expect(farmRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['producer'],
      });
      expect(result).toBe(farm);
    });

    it('should throw NotFoundException if not found', async () => {
      farmRepo.findOne!.mockResolvedValue(undefined);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated farm', async () => {
      const dto: UpdateFarmDto = { city: 'Nova Cidade' };
      const existing = {
        id: '1',
        name: 'Old',
        city: 'OldCity',
        state: 'ST',
        totalArea: 100,
        arableArea: 40,
        vegetationArea: 40,
        producer: { id: 'p1' } as Producer,
        createdAt: new Date(),
        updatedAt: new Date(),
        cultivations: [],
      } as Farm;
      const updated = { ...existing, ...dto } as Farm;

      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      farmRepo.save!.mockResolvedValue(updated);

      const result = await service.update('1', dto);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(farmRepo.save).toHaveBeenCalledWith({ ...existing, ...dto });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if update does not find farm', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.update('1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if areas invalid after update', async () => {
      const existing = {
        id: '1',
        name: 'X',
        city: 'C',
        state: 'ST',
        totalArea: 30,
        arableArea: 20,
        vegetationArea: 20,
        producer: { id: 'p1' } as Producer,
        createdAt: new Date(),
        updatedAt: new Date(),
        cultivations: [],
      } as Farm;
      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      const dto: UpdateFarmDto = { arableArea: 20, vegetationArea: 20 };
      await expect(service.update('1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete successfully', async () => {
      farmRepo.delete!.mockResolvedValue({ affected: 1 } as any);
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(farmRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if delete affects no rows', async () => {
      farmRepo.delete!.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
