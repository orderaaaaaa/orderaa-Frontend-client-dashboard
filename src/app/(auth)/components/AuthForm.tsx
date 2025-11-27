'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthHeader from './AuthHeader';
import AuthSwitch from './AuthSwitch';

interface AuthFormProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
  isSubmitting: boolean;
  submitButtonText: string;
  submitButtonLoadingText: string;
  switchGoTo: 'signin' | 'signup';
  showSwitch?: boolean;
}

export default function AuthForm({
  children,
  title,
  subtitle,
  onSubmit,
  error,
  isSubmitting,
  submitButtonText,
  submitButtonLoadingText,
  switchGoTo,
  showSwitch = true,
}: AuthFormProps) {
  return (
    <div className="flex items-center justify-center min-h-screen py-5 px-4">
      <section className="flex flex-col justify-center items-center p-7 w-full max-w-2xl border border-[#52525214] rounded-lg shadow-lg shadow-[#212121]">
        <AuthHeader title={title} subtitle={subtitle} />

        <form
          onSubmit={onSubmit}
          className="flex flex-col w-full max-w-lg space-y-5 mx-auto mt-6"
          dir="rtl"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {children}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {isSubmitting ? submitButtonLoadingText : submitButtonText}
          </button>
        </form>

        {showSwitch && <AuthSwitch goTo={switchGoTo} />}
      </section>
    </div>
  );
}
