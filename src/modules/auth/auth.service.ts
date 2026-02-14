import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { SignupDto } from '../../dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username, password },
    });
    return user;
  }

  async signup(signupDto: SignupDto): Promise<User> {
    const newUser = this.userRepository.create({
      id: 'user_' + uuidv4().split('-')[0],
      username: signupDto.username,
      password: signupDto.password,
      email: signupDto.email,
      fullName: signupDto.fullName,
      phone: signupDto.phone,
      companyName: signupDto.companyName,
      role: 'user',
      active: true,
    });

    return await this.userRepository.save(newUser);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}