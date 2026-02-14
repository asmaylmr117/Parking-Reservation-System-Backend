import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from '../../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.username, loginDto.password);
    
    if (!result) {
      throw new HttpException(
        { status: 'error', message: 'Invalid credentials' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      user: {
        id: result.id,
        username: result.username,
        role: result.role,
      },
      token: 'token-' + result.id,
    };
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const existingUser = await this.authService.findByUsername(signupDto.username);
    
    if (existingUser) {
      throw new HttpException(
        { status: 'error', message: 'Username already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authService.signup(signupDto);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token: 'token-' + user.id,
    };
  }
}