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
import { SeasonsService } from './seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { Season } from './entities/season.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly service: SeasonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new season' })
  @ApiResponse({
    status: 201,
    description: 'Season created successfully.',
    type: Season,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSeasonDto): Promise<Season> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all seasons' })
  @ApiResponse({
    status: 200,
    description: 'Array of seasons.',
    type: [Season],
  })
  findAll(): Promise<Season[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single season by id' })
  @ApiResponse({ status: 200, description: 'The season object.', type: Season })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  findOne(@Param('id') id: string): Promise<Season> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a season' })
  @ApiResponse({
    status: 200,
    description: 'The updated season.',
    type: Season,
  })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSeasonDto,
  ): Promise<Season> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a season' })
  @ApiResponse({ status: 204, description: 'Season deleted.' })
  @ApiResponse({ status: 404, description: 'Season not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
