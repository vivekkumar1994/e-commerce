'use client';

import { useState, FormEvent, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { signIn, signUp } from '@/action/AuthAction';

type UserRole = 'user' | 'admin' | 'seller';

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface SignUpFormData {
  email: string;
  password: string;
  reenterPassword: string;
  name: string;
  role?: string; // Optional role, defaults to 'seller'
}

interface LoginFormData {
  email: string;
  password: string;
}

function AuthForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [isSignUp, setIsSignUp] = useState(typeParam !== 'login');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);

  const router = useRouter();
  const [inputValues, setInputValues] = useState<Partial<SignUpFormData & LoginFormData>>({
    role: 'seller', // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData = isSignUp
    ? [
        { marker: 'name', localizeInfos: { title: 'Name' } },
        { marker: 'email', localizeInfos: { title: 'Email' } },
        { marker: 'password', localizeInfos: { title: 'Password' } },
      ]
    : [
        { marker: 'email', localizeInfos: { title: 'Email' } },
        { marker: 'password', localizeInfos: { title: 'Password' } },
      ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));

    if (isSignUp && name === 'password' && value) {
      setShowReenterPassword(true);
    }

    if (isSignUp && (name === 'password' || name === 'reenterPassword')) {
      setPasswordMatchError(inputValues.password !== value && name === 'reenterPassword');
    }

    if (name === 'email' && value.includes('@')) {
      setAiSuggestion('Make sure your email is valid and professional.');
    } else {
      setAiSuggestion(null);
    }
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaVerified(!!value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error('Please verify the reCAPTCHA.');
      return;
    }

    if (isSignUp && inputValues.password !== inputValues.reenterPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (inputValues.email && inputValues.password && inputValues.name) {
          const res = await signUp({
            email: inputValues.email,
            password: inputValues.password,
            name: inputValues.name,
            role: inputValues.role || 'seller', // Always use seller role
          });

          toast.success(res.message);
          setIsSignUp(false);
          setInputValues({ role: 'seller' });
          router.push('/seller?type=login');
        }
      } else {
        if (inputValues.email && inputValues.password) {
          const res: {
            message: string;
            user: User;
          } = await signIn({
            email: inputValues.email,
            password: inputValues.password,
          });

          if (res.user?.role !== 'seller') {
            toast.error('Access denied. Only sellers can log in.');
            setIsSubmitting(false);
            return;
          }

          toast.success(res.message);
          router.push('/dashboard');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
    setInputValues({ role: 'seller' }); // Reset with default role
    setAiSuggestion(null);
    setPasswordMatchError(false);
    setShowReenterPassword(false);
    router.replace(`/seller?type=${isSignUp ? 'login' : 'signup'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-2xl bg-zinc-900/90 backdrop-blur-md">
        <div className="mb-6 flex items-center cursor-pointer" onClick={() => router.push('/')}>
          <ChevronLeft className="text-gray-300 h-5 w-5 border rounded-full p-1 hover:bg-gray-700 transition duration-300" />
          <span className="ml-2 text-sm text-gray-300 hover:text-white transition duration-300">
            Back to Home
          </span>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-purple-400">🔒 Seller Portal</p>
          <h2 className="text-3xl font-bold mt-1 mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            {isSignUp ? 'Create Seller Account' : 'Seller Login'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isSignUp
              ? 'Register as a seller to manage your store.'
              : 'Login with your seller credentials.'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {formData.map((field) => (
            <div key={field.marker}>
              <Label htmlFor={field.marker} className="text-base text-gray-300 mb-2 block">
                {field.localizeInfos.title}
              </Label>
              <Input
                id={field.marker}
                type={field.marker.includes('password') ? 'password' : 'text'}
                name={field.marker}
                className="text-base p-3 bg-zinc-800 border border-zinc-600 rounded-md focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                placeholder={field.localizeInfos.title}
                value={inputValues[field.marker as keyof (SignUpFormData & LoginFormData)] || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          ))}

          {isSignUp && showReenterPassword && (
            <div>
              <Label htmlFor="reenterPassword" className="text-base text-gray-300 mb-2 block">
                Re-enter Password
              </Label>
              <Input
                id="reenterPassword"
                type="password"
                name="reenterPassword"
                className={`text-base p-3 bg-zinc-800 border ${
                  passwordMatchError ? 'border-red-500' : 'border-zinc-600'
                } rounded-md focus:ring-2 focus:ring-purple-500 placeholder-gray-400`}
                placeholder="Re-enter Password"
                value={inputValues.reenterPassword || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {passwordMatchError && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match.</p>
              )}
            </div>
          )}

          {/* ✅ Hidden role input */}
          {isSignUp && (
            <input type="hidden" name="role" value="seller" />
          )}

          {aiSuggestion && (
            <div className="text-sm text-purple-400 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              {aiSuggestion}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2">Please verify you are not a robot</p>
            <div
              className={`p-3 bg-zinc-800 rounded-md shadow-md border ${
                captchaVerified ? 'border-purple-500' : 'border-zinc-600'
              } transition duration-300`}
            >
              <ReCAPTCHA
                sitekey="6LerblorAAAAADJvzoI03NAQUuH1v3t-4-5QsFB3"
                onChange={handleCaptchaChange}
              />
            </div>
          </div>

          <Button
            className={`w-full text-base font-semibold p-3 rounded-md transition duration-300 ${
              passwordMatchError || !captchaVerified
                ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:to-pink-700'
            }`}
            disabled={isSubmitting || passwordMatchError || !captchaVerified}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <p className="text-base text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <Button
            variant="link"
            className="text-base text-purple-400 hover:text-purple-300 ml-2 transition duration-200"
            onClick={toggleForm}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
