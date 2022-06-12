import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email already exists
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    // Hash user password
    // Generate a salt
    // 1 bajt -> 2 characters
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save
    const user = await this.usersService.create(email, result);

    // return the new user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, hash] = user.password.split('.');
    const checkedHash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash !== checkedHash.toString('hex')) {
      throw new BadRequestException('Wrong password');
    }

    return user;
  }
}
