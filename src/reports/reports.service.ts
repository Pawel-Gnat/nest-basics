import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async createEstimate(estimateDto: GetEstimateDto) {
    const { make, model, lng, lat, year, mileage } = estimateDto;

    const rows: { price: number }[] = await this.repo
      .createQueryBuilder('report')
      .select('report.price', 'price')
      .where('report.make = :make', { make })
      .andWhere('report.model = :model', { model })
      .andWhere('report.lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('report.lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('report.year - :year BETWEEN -3 AND 3', { year })
      .andWhere('report.approved = :approved', { approved: true })
      .orderBy('ABS(report.mileage - :mileage)', 'ASC')
      .setParameter('mileage', mileage)
      .limit(3)
      .getRawMany();

    if (rows.length === 0) {
      return null;
    }

    const sum = rows.reduce((acc, row) => acc + row.price, 0);
    return Math.round(sum / rows.length);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOneBy({ id: parseInt(id) });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approved;
    return this.repo.save(report);
  }
}
