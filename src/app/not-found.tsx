'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="relative mb-8">
          <div className="inline-block relative">
            <h1 className="text-[clamp(8rem,20vw,16rem)] font-bold leading-none tracking-tighter">
              <span className="inline-block text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
                4
              </span>
              <span className="inline-block relative mx-2">
                <span className="text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                  0
                </span>
                {/* <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[120%] h-[120%] border-4 border-primary rounded-full animate-spin-slow opacity-40" />
                </div> */}
              </span>
              <span className="inline-block text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                4
              </span>
            </h1>

            <div className="absolute -top-8 -right-12 md:-right-24 animate-in zoom-in duration-1000 delay-500">
              <img
                src="/Ordera.svg"
                alt="Lost astronaut"
                className="w-24 h-24 md:w-32 md:h-32 animate-float"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            Oops! Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {
              "Looks like you've ventured off the Orderaa map. The page you're looking for doesn't exist or has been moved."
            }
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <Button
            asChild
            size="lg"
            className="min-w-[200px] group text-xl bg-primary hover:bg-[#6b33ee]"
          >
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[200px] group bg-transparent text-xl"
          >
            <Link href="javascript:history.back()">
              Go Back
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
