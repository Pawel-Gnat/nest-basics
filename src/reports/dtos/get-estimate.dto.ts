import { OmitType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNumber, Max, Min } from 'class-validator';
import { CreateReportDto } from './create-report.dto';

const CURRENT_YEAR = new Date().getFullYear();

export class GetEstimateDto extends OmitType(CreateReportDto, ['price']) {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1930)
  @Max(CURRENT_YEAR)
  year: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsLongitude()
  lng: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsLatitude()
  lat: number;
}
