import { User } from '@/store/slices/authSlice';

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'demo@forexpro.com',
    firstName: 'Demo',
    lastName: 'User',
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: '+1234567890',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    preferredCurrency: 'USD',
    kycStatus: 'approved',
    twoFactorEnabled: false,
  },
  {
    id: '2',
    email: 'trader@forexpro.com',
    firstName: 'Pro',
    lastName: 'Trader',
    avatar: 'https://via.placeholder.com/150',
    phoneNumber: '+0987654321',
    isVerified: true,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: new Date().toISOString(),
    preferredCurrency: 'EUR',
    kycStatus: 'approved',
    twoFactorEnabled: true,
  },
];

// Mock credentials
const MOCK_CREDENTIALS = [
  { email: 'demo@forexpro.com', password: 'demo123' },
  { email: 'trader@forexpro.com', password: 'trader123' },
];

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    const mockUser = MOCK_CREDENTIALS.find(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );

    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const user = MOCK_USERS.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('User not found');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    return {
      user,
      token: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1200); // Simulate network delay

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: `${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferredCurrency: 'USD',
      kycStatus: 'not_started',
      twoFactorEnabled: false,
    };

    // Add to mock database
    MOCK_USERS.push(newUser);
    MOCK_CREDENTIALS.push({
      email: data.email,
      password: data.password,
    });

    return {
      user: newUser,
      token: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await delay(500);

    if (!refreshToken.startsWith('mock_refresh_token_')) {
      throw new Error('Invalid refresh token');
    }

    return {
      token: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };
  }

  async logout(): Promise<void> {
    await delay(300);
    // In a real app, this would invalidate the token on the server
  }

  async forgotPassword(email: string): Promise<void> {
    await delay(800);

    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    // In a real app, this would send a password reset email
    console.log(`Password reset email sent to ${email}`);
  }

  async checkBiometricAvailability(): Promise<boolean> {
    await delay(200);
    // Mock biometric availability
    return Math.random() > 0.2; // 80% chance of being available
  }

  async setupBiometric(): Promise<boolean> {
    await delay(1000);
    // Mock biometric setup
    return Math.random() > 0.1; // 90% success rate
  }
}

export const authService = new AuthService();
