'use client';

import { useState } from 'react';
import { usePlans, useActiveSubscription, useSubscribe } from '@/services/subscriptions';
import { Plan, PlanType, ActiveSubscription } from '@/types/wallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiaCheckCircleSolid as LiaCheckCircle } from 'react-icons/lia';
import { LiaTimesCircleSolid as LiaTimesCircle } from 'react-icons/lia';
import { LiaGem } from 'react-icons/lia';

function SubscriptionPlans() {
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = usePlans();
  const { data: activeSubscription, isLoading: subLoading } = useActiveSubscription();
  const subscribeMutation = useSubscribe();

  const activePlanId = activeSubscription?.planId ?? null;

  const handleSubscribe = async (planId: number) => {
    try {
      await subscribeMutation.mutateAsync(planId);
      setStatusMessage({ text: 'تم الاشتراك في الخطة بنجاح!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      console.error('Subscription failed:', error);
      setStatusMessage({ text: 'فشل الاشتراك في الخطة. يرجى المحاولة مرة أخرى.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const getTypeLabel = (type: PlanType) => (type === 'UNLIMITED' ? 'غير محدود' : 'لكل طلب');

  const getPriceDisplay = (plan: Plan) => {
    if (plan.type === 'UNLIMITED') {
      return `${plan.subscriptionPrice} ${plan.currency} / شهرياً`;
    }
    return `${plan.pricePerOrder} ${plan.currency} / لكل طلب`;
  };

  const getDurationDisplay = (plan: Plan) => `لمدة ${plan.durationDays} يوم`;

  const isMostEconomical = (plan: Plan, allPlans: Plan[]) => {
    if (plan.type !== 'UNLIMITED') return false;
    const unlimitedPlans = allPlans.filter((p) => p.type === 'UNLIMITED' && p.isActive);
    if (unlimitedPlans.length === 0) return false;
    const cheapest = unlimitedPlans.reduce((min, p) =>
      Number(p.subscriptionPrice || '0') < Number(min.subscriptionPrice || '0') ? p : min
    );
    return cheapest.id === plan.id;
  };

  if (plansLoading || subLoading) {
    return (
      <section id="subscription-plans" className="mt-13 sm:px-4" dir="rtl">
        <h2 className="text-2xl font-bold mb-8">خطط الاشتراك</h2>
        <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 border bg-white border-gray-100 shadow-xl animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="h-10 bg-gray-200 rounded-full mt-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (plansError) {
    return (
      <section id="subscription-plans" className="mt-13 sm:px-4" dir="rtl">
        <h2 className="text-2xl font-bold mb-8">خطط الاشتراك</h2>
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-xl">
          <p className="text-red-600 font-medium mb-4">تعذر تحميل خطط الاشتراك</p>
          <Button variant="outline" onClick={() => refetchPlans()}>
            إعادة المحاولة
          </Button>
        </div>
      </section>
    );
  }

  const activePlans = plans?.filter((p) => p.isActive) ?? [];

  if (activePlans.length === 0) {
    return (
      <section id="subscription-plans" className="mt-13 sm:px-4" dir="rtl">
        <h2 className="text-2xl font-bold mb-8">خطط الاشتراك</h2>
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-xl">
          <p className="text-gray-600 font-medium">لا توجد خطط اشتراك متاحة حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section id="subscription-plans" className="mt-13 sm:px-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-8">خطط الاشتراك</h2>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-center animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
          role="alert"
        >
          {statusMessage.text}
        </div>
      )}

      <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {activePlans.map((plan) => {
          const isActive = plan.id === activePlanId;
          const isEconomical = !activePlanId && isMostEconomical(plan, activePlans);

          return (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-6 border min-h-[420px] flex flex-col transition-all duration-300 hover:scale-105 overflow-hidden text-right
                ${
                  isEconomical
                    ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 border-transparent text-white shadow-xl shadow-purple-500/25'
                    : isActive
                    ? 'bg-green-50 border-green-200 text-gray-800 shadow-xl shadow-green-500/10'
                    : 'bg-white border-gray-100 shadow-xl text-gray-800'
                }
              `}
            >
              {isActive && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    مشترك حالياً
                  </Badge>
                </div>
              )}

              {isEconomical && !isActive && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <LiaGem className="w-3 h-3 ml-1" />
                    الأفضل قيمة
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={isEconomical ? 'text-yellow-200' : isActive ? 'text-green-600' : 'text-purple-600'}>
                  <LiaGem className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-medium">{plan.title}</h3>
              </div>

              <div className="relative z-10 flex flex-col gap-6 flex-1">
                <div className="flex items-baseline gap-4 mb-4">
                  <span
                    className={`
                      text-4xl font-bold
                      ${isEconomical ? 'text-white' : isActive ? 'text-green-700' : 'text-purple-700'}
                    `}
                  >
                    {plan.type === 'UNLIMITED' ? plan.subscriptionPrice : plan.pricePerOrder}
                  </span>
                  <p
                    className={`
                      text-xl font-medium
                      ${isEconomical ? 'text-purple-100' : isActive ? 'text-green-600' : 'text-gray-900'}
                    `}
                  >
                    {plan.type === 'UNLIMITED' ? ` ${plan.currency} / شهرياً` : ` ${plan.currency} / لكل طلب`}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`
                    text-sm px-3 py-1
                    ${plan.type === 'UNLIMITED' ? 'border-purple-300 text-purple-700' : 'border-orange-300 text-orange-700'}
                  `}
                >
                  {getTypeLabel(plan.type)}
                </Badge>

                <p className={isEconomical ? 'text-purple-100' : 'text-gray-600'}>{getDurationDisplay(plan)}</p>

                {plan.description && (
                  <p className={isEconomical ? 'text-purple-100' : 'text-gray-600'}>{plan.description}</p>
                )}

                <ul className="space-y-4 mt-4">
                  {plan.type === 'UNLIMITED' ? (
                    <>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">عدد غير محدود من الطلبات</span>
                      </li>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">سعر ثابت شهرياً</span>
                      </li>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">لا توجد رسوم إضافية لكل طلب</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">دفع لكل طلب فقط</span>
                      </li>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">لا يوجد التزام شهري</span>
                      </li>
                      <li className="flex justify-start items-center gap-3">
                        <span className={isEconomical ? 'text-yellow-200' : 'text-green-500'}>
                          <LiaCheckCircle className="w-6 h-6" />
                        </span>
                        <span className="text-base font-medium">مناسب للأحجام الصغيرة</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <Button
                className={`
                  w-full mt-auto py-3 rounded-full font-bold transition text-lg
                  ${isActive
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : isEconomical
                    ? 'bg-white text-purple-700 hover:bg-gray-100'
                    : 'bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700'}
                `}
                onClick={() => !isActive && handleSubscribe(plan.id)}
                disabled={isActive || subscribeMutation.isPending}
                loading={subscribeMutation.isPending}
                loadingText="جاري الاشتراك..."
              >
                {isActive ? 'مشترك حالياً' : 'اشترك الآن'}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SubscriptionPlans;