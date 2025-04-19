'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaUser } from 'react-icons/fa';
import React from 'react';

interface LoginPageProps {
  params: {
    lang: string;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  // Next.js 15'te params Promise olduğu için React.use() ile unwrap ediyoruz
  const resolvedParams = React.use(params);
  const lang = resolvedParams.lang;
  
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Başarılı giriş, admin paneline yönlendir
        router.push(`/${lang}/admin`);
      } else {
        // Hata mesajı göster
        setError(data.message || (lang === 'tr' ? 'Giriş başarısız' : 'Login failed'));
      }
    } catch (err) {
      setError(lang === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {lang === 'tr' ? 'Giriş' : 'Login'}
          </h1>
          <p className="text-gray-600 mt-2">
            {lang === 'tr' 
              ? 'Lütfen giriş bilgilerinizi girin' 
              : 'Please enter your login credentials'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              {lang === 'tr' ? 'Kullanıcı Adı' : 'Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'tr' ? 'Kullanıcı adınız' : 'Your username'}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              {lang === 'tr' ? 'Şifre' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={lang === 'tr' ? 'Şifreniz' : 'Your password'}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span>{lang === 'tr' ? 'Giriş Yapılıyor...' : 'Signing in...'}</span>
            ) : (
              <span>{lang === 'tr' ? 'Giriş Yap' : 'Sign in'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={`/${lang}`} className="text-teal-600 hover:underline">
            {lang === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Home Page'}
          </Link>
        </div>
      </div>
    </div>
  );
} 