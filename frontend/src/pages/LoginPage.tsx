import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { UserLoginRequest } from '../types/api';

const loginSchema = z.object({
  username: z.string().min(5, 'Username must be at least 5 characters'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: UserLoginRequest) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(data);
      
      // Decode JWT to get user info (simple base64 decode)
      const tokenParts = response.token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Backend JWT structure: { sub: "username", role: "Administrator", exp: ... }
      const user = {
        id: 1, // Backend doesn't send ID in token, use dummy value
        username: payload.sub, // sub contains the username
        type: payload.role as any, // role contains the user type
      };

      login(response.token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">EZShop</h1>
            <p className="text-gray-600 mt-2">Shop Manager</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
                {...register('username')}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Default credentials: admin / admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
