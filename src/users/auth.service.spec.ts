import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { NotAcceptableException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password }),
      isEmailExists: () => Promise.resolve(null),
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
    fakeUsersService.isEmailExists = () =>
      Promise.resolve({ id: 1, email: 'test@example.com', password: 'test' });

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
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'test@example.com', password: 'test' }]);

    await expect(service.signin('test@example.com', 'test1')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'test@example.com', password: 'test' }]);

    const user = await service.signin('test@example.com', 'test');
    expect(user).toBeDefined();
  });
});
