import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { Farm } from '../farms/entities/farm.entity';
import { Cultivation } from '../cultivation/entities/cultivation.entity';

class MockQB {
  select = jest.fn().mockReturnThis();
  addSelect = jest.fn().mockReturnThis();
  groupBy = jest.fn().mockReturnThis();
  getRawOne = jest.fn();
  getRawMany = jest.fn();
}

type MockRepo<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
> & {
  createQueryBuilder?: jest.Mock;
};

const makeMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  createQueryBuilder: jest.fn(),
});

describe('DashboardService', () => {
  let service: DashboardService;
  let farmRepo: MockRepo<Farm>;
  let cultRepo: MockRepo<Cultivation>;

  beforeEach(async () => {
    farmRepo = makeMockRepo<Farm>();
    cultRepo = makeMockRepo<Cultivation>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Farm), useValue: farmRepo },
        { provide: getRepositoryToken(Cultivation), useValue: cultRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('getSummary returns correct values', async () => {
    const qb = new MockQB();
    qb.getRawOne.mockResolvedValue({ count: '5', sum: '150.5' });
    farmRepo.createQueryBuilder!.mockReturnValue(qb);

    const result = await service.getSummary();
    expect(farmRepo.createQueryBuilder).toHaveBeenCalledWith('f');
    expect(result).toEqual({ totalFarms: 5, totalArea: 150.5 });
  });

  it('getByState returns mapped rows', async () => {
    const qb = new MockQB();
    qb.getRawMany.mockResolvedValue([{ state: 'SP', count: '3' }]);
    farmRepo.createQueryBuilder!.mockReturnValue(qb);

    const result = await service.getByState();
    expect(farmRepo.createQueryBuilder).toHaveBeenCalledWith('f');
    expect(result).toEqual([{ state: 'SP', count: 3 }]);
  });

  it('getByCrop returns mapped rows', async () => {
    const qb = new MockQB();
    qb.getRawMany.mockResolvedValue([{ crop: 'Soja', count: '4' }]);
    cultRepo.createQueryBuilder!.mockReturnValue(qb);

    const result = await service.getByCrop();
    expect(cultRepo.createQueryBuilder).toHaveBeenCalledWith('c');
    expect(result).toEqual([{ crop: 'Soja', count: 4 }]);
  });

  it('getLandUse returns correct values', async () => {
    const qb = new MockQB();
    qb.getRawOne.mockResolvedValue({ arable: '60', vegetation: '40' });
    farmRepo.createQueryBuilder!.mockReturnValue(qb);

    const result = await service.getLandUse();
    expect(farmRepo.createQueryBuilder).toHaveBeenCalledWith('f');
    expect(result).toEqual({ arable: 60, vegetation: 40 });
  });
});
