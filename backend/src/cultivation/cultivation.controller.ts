import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CultivationService } from './cultivation.service';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { Cultivation } from './entities/cultivation.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cultivations')
@Controller('cultivations')
export class CultivationController {
  constructor(private readonly service: CultivationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cultivation record' })
  @ApiResponse({
    status: 201,
    description: 'Cultivation created successfully.',
    type: Cultivation,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCultivationDto): Promise<Cultivation> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all cultivation records' })
  @ApiResponse({
    status: 200,
    description: 'Array of cultivations.',
    type: [Cultivation],
  })
  findAll(@Query('farmId') farmId?: string): Promise<Cultivation[]> {
    if (farmId) {
      return this.service.findByFarmId(farmId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single cultivation by id' })
  @ApiResponse({
    status: 200,
    description: 'The cultivation object.',
    type: Cultivation,
  })
  @ApiResponse({ status: 404, description: 'Cultivation not found.' })
  findOne(@Param('id') id: string): Promise<Cultivation> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cultivation record' })
  @ApiResponse({
    status: 200,
    description: 'The updated cultivation.',
    type: Cultivation,
  })
  @ApiResponse({ status: 404, description: 'Cultivation not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCultivationDto,
  ): Promise<Cultivation> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a cultivation record' })
  @ApiResponse({ status: 204, description: 'Cultivation deleted.' })
  @ApiResponse({ status: 404, description: 'Cultivation not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
