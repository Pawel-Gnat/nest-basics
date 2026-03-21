import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) =>
        Promise.resolve(users.filter((user) => user.email === email)),
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        };
        users.push(user);
        return Promise.resolve(user);
      },
      isEmailExists: (email: string) => {
        const user = users.find((user) => user.email === email);
        return Promise.resolve(user || null);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@example.com', 'test');
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('test');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@example.com', 'test');

    await expect(service.signup('test@example.com', 'test')).rejects.toThrow(
      NotAcceptableException,
    );
  });

  it('throws an error if user signs in with email that is not in use', async () => {
    await expect(service.signin('test@example.com', 'test')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup('test@example.com', 'test');

    await expect(service.signin('test@example.com', 'test1')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@example.com', 'test');

    const user = await service.signin('test@example.com', 'test');
    expect(user).toBeDefined();
  });
});
