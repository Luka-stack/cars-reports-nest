import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
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

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('some@email.com', 'password');
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('password');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    await service.signup('some@email.com', 'password');

    await expect(service.signup('some@email.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('email@exp.com', 'asd');

    await expect(service.signin('email@exp.com', 'passwd')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('email@exp.com', 'password-strong');

    const user = await service.signin('email@exp.com', 'password-strong');
    expect(user).toBeDefined();
  });
});
