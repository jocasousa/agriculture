import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SummaryDto } from './dto/summary.dto';
import { StateCountDto } from './dto/state-count.dto';
import { CropCountDto } from './dto/crop-count.dto';
import { LandUseDto } from './dto/land-use.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall farms summary' })
  @ApiResponse({
    status: 200,
    description: 'Total number of farms and total area',
    type: SummaryDto,
  })
  getSummary(): Promise<SummaryDto> {
    return this.service.getSummary();
  }

  @Get('by-state')
  @ApiOperation({ summary: 'Get count of farms grouped by state' })
  @ApiResponse({
    status: 200,
    description: 'Array of states with farm counts',
    type: [StateCountDto],
  })
  getByState(): Promise<StateCountDto[]> {
    return this.service.getByState();
  }

  @Get('by-crop')
  @ApiOperation({ summary: 'Get count of cultivations grouped by crop' })
  @ApiResponse({
    status: 200,
    description: 'Array of crops with cultivation counts',
    type: [CropCountDto],
  })
  getByCrop(): Promise<CropCountDto[]> {
    return this.service.getByCrop();
  }

  @Get('land-use')
  @ApiOperation({ summary: 'Get total arable and vegetation areas' })
  @ApiResponse({
    status: 200,
    description: 'Object with arable and vegetation totals',
    type: LandUseDto,
  })
  getLandUse(): Promise<LandUseDto> {
    return this.service.getLandUse();
  }
}
