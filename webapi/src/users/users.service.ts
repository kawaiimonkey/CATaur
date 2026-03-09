import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole, Role } from '../database/entities/user-role.entity';
import { UlidService } from '../common/ulid.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(UserRole)
        private userRolesRepository: Repository<UserRole>,
        private ulidService: UlidService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) { }

    private async clearUserCache(email: string): Promise<void> {
        await this.cacheManager.del(`auth_user_${email}`);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email }, relations: ['roles'] });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id }, relations: ['roles'] });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['roles'] });
    }

    async create(userData: Partial<User> & { roles?: Role[] }): Promise<User> {
        const userId = this.ulidService.generate();
        const roles = userData.roles || [Role.USER];

        // Remove roles from userData to avoid error when saving User
        const { roles: _, ...userFields } = userData;

        const newUser = this.usersRepository.create({
            id: userId,
            ...userFields,
        });

        await this.usersRepository.save(newUser);

        // Create user roles
        const userRoles = roles.map(role => this.userRolesRepository.create({
            userId: userId,
            role: role
        }));

        await this.userRolesRepository.save(userRoles);

        return this.findOneById(userId) as Promise<User>;
    }

    async findByRole(role: Role): Promise<User[]> {
        const userRoles = await this.userRolesRepository.find({
            where: { role: role },
            relations: ['user', 'user.roles']
        });
        return userRoles.map(ur => ur.user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        const updatedUser = await this.usersRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new NotFoundException('User not found after update');
        }
        await this.clearUserCache(updatedUser.email);
        return updatedUser;
    }

    async assignRoles(userId: string, roles: Role[]): Promise<User> {
        const user = await this.findOneById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Delete existing roles
        await this.userRolesRepository.delete({ userId });

        // Create new roles
        const userRoles = roles.map(role => this.userRolesRepository.create({
            userId,
            role
        }));
        await this.userRolesRepository.save(userRoles);

        await this.clearUserCache(user.email);

        return this.findOneById(userId) as Promise<User>;
    }
}
