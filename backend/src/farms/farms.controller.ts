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
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './entities/farm.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Farms')
@Controller('farms')
export class FarmsController {
  constructor(private readonly service: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({
    status: 201,
    description: 'The farm has been successfully created.',
    type: Farm,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateFarmDto): Promise<Farm> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all farms or filter by producerId' })
  @ApiResponse({ status: 200, description: 'List of farms.', type: [Farm] })
  findAll(@Query('producerId') producerId?: string): Promise<Farm[]> {
    if (producerId) {
      return this.service.findByProducerId(producerId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single farm by id' })
  @ApiResponse({ status: 200, description: 'The farm object.', type: Farm })
  @ApiResponse({ status: 404, description: 'Farm not found.' })
  findOne(@Param('id') id: string): Promise<Farm> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a farm' })
  @ApiResponse({ status: 200, description: 'The updated farm.', type: Farm })
  @ApiResponse({ status: 404, description: 'Farm not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateFarmDto): Promise<Farm> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a farm' })
  @ApiResponse({ status: 204, description: 'Farm deleted.' })
  @ApiResponse({ status: 404, description: 'Farm not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
