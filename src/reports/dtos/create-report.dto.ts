import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateReportDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1930)
  @Max(CURRENT_YEAR)
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsNumber()
  @IsLatitude()
  lat: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;
}
