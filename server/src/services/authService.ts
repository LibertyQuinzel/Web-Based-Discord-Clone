import { UserService } from './userService';
import { generateToken } from '../utils/jwt';
import { CreateUserInput, LoginInput, UserResponse, JwtPayload } from '../types';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(userData: CreateUserInput): Promise<{ user: UserResponse; token: string }> {
    const user = await this.userService.createUser(userData);
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return { user, token };
  }

  async login(loginData: LoginInput): Promise<{ user: UserResponse; token: string }> {
    const user = await this.userService.validatePassword(loginData.email, loginData.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return { user, token };
  }

  async refreshToken(userPayload: JwtPayload): Promise<{ user: UserResponse; token: string }> {
    const user = await this.userService.findById(userPayload.id);

    if (!user) {
      throw new Error('User not found');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return { user, token };
  }
}
