// 'use client';

// import React from 'react';
// import { useRouter } from 'next/navigation';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import AuthHeader from '../components/AuthHeader';
// import AuthSwitch from '../components/AuthSwitch';

// interface AuthFormProps {
//   children: React.ReactNode;
// }

// export default function AuthForm({ children }: AuthFormProps) {
//   const router = useRouter();

//   return (
//     <div className="min-h-screen flex items-center justify-center mt-10 mb-10">
//       <section className="flex flex-col justify-center items-center p-12 border border-[#52525214] rounded-lg shadow-lg shadow-[#212121]">
//         <AuthHeader
//           title="انشاء حساب جديد"
//           subtitle="ادخل معلوماتك للمتابعة مع Orderaa"
//         />

//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="flex flex-col w-full max-w-lg space-y-5 mx-auto mt-10"
//           dir="rtl"
//         >
//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {children}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-[#5D24E1] text-white py-2.5 rounded-lg transition disabled:opacity-60"
//           >
//             {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
//           </button>
//         </form>

//         <AuthSwitch goTo="signin" />
//       </section>
//     </div>
//   );
// }
