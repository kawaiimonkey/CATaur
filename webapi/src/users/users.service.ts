import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private ulidService: UlidService,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const rounds = 10;
        const password = userData.password || '';
        const hashedPassword = await bcrypt.hash(password, rounds);
        const newUser = this.usersRepository.create({
            id: this.ulidService.generate(),
            ...userData,
            password: hashedPassword,
        });
        return this.usersRepository.save(newUser);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        const updatedUser = await this.usersRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new Error('User not found after update');
        }
        return updatedUser;
    }
}
