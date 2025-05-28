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
} from '@nestjs/common';
import { ProducersService } from './producers.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { Producer } from './entities/producer.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Producers')
@Controller('producers')
export class ProducersController {
  constructor(private readonly service: ProducersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new producer' })
  @ApiResponse({ status: 201, description: 'Producer created successfully.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProducerDto): Promise<Producer> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all producers' })
  @ApiResponse({ status: 200, description: 'Array of producers.' })
  findAll(): Promise<Producer[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a producer by id' })
  @ApiResponse({ status: 200, description: 'The producer object.' })
  findOne(@Param('id') id: string): Promise<Producer> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a producer' })
  @ApiResponse({ status: 200, description: 'The updated producer.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProducerDto,
  ): Promise<Producer> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a producer' })
  @ApiResponse({ status: 204, description: 'Producer deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
