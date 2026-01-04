import React from 'react';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import WorkHoursTimePicker from '@/components/ui/WorkHoursTimePicker';
import { useGovernoratesQuery } from '@/services/lookups';
import {
  validateEgyptianPhoneNumber,
  getPhoneNumberErrorMessage,
} from '@/utils/validators/phoneValidator';
import {
  User,
  Phone,
  Briefcase,
  MapPin,
  Mail,
  Lock,
  Clock,
} from 'lucide-react';

import {
  ACCESS_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
} from '@/app/dashboard/employees/constants/employeesFormOptions';
import { EmployeeFormFieldsProps } from '../types/employee.types';

export default function EmployeeFormFields({
  register,
  errors,
  watch,
  setValue,
}: EmployeeFormFieldsProps) {
  const accessLevel = watch('accessLevel');
  const department = watch('department');
  const address = watch('address');
  const workingHours = watch('workingHours');
  const { data: governorates = [] } = useGovernoratesQuery();

  return (
    <div
      className="px-4 md:px-8 lg:px-[165px] py-6 md:py-[34px]"
      style={{ direction: 'rtl' }}
    >
      <div
        className="flex flex-col items-end gap-6"
        style={{ direction: 'rtl' }}
      >
        {/* Employee Access */}
        <div
          className="w-full flex flex-col items-end gap-4"
          style={{ direction: 'rtl' }}
        >
          <div
            className="w-full flex items-center gap-2"
            style={{
              direction: 'rtl',
              justifyContent: 'flex-start',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <User
              className="w-6 h-6 text-primary flex-shrink-0"
              strokeWidth={1.5}
            />
            <span
              className="text-base md:text-lg font-normal text-right"
              style={{ textAlign: 'right' }}
            >
              صلاحية الموظف
            </span>
          </div>
          <div className="w-full">
            <SearchableSelect
              value={accessLevel || ''}
              onChange={(value) =>
                setValue('accessLevel', value, { shouldValidate: true })
              }
              options={ACCESS_LEVEL_OPTIONS}
              placeholder="اختر صلاحية الموظف"
              widthClass="w-full"
              error={errors?.accessLevel?.message}
              triggerClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${errors?.accessLevel ? 'border-red-500' : 'border-black/16'
                } rounded text-right text-base font-normal text-black`}
            />
          </div>
        </div>

        {/* Employee Department  */}
        <div
          className="w-full flex flex-col items-end gap-4"
          style={{ direction: 'rtl' }}
        >
          <div
            className="w-full flex items-center gap-2"
            style={{
              direction: 'rtl',
              justifyContent: 'flex-start',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <User
              className="w-6 h-6 text-primary flex-shrink-0"
              strokeWidth={1.5}
            />
            <span
              className="text-base md:text-lg font-normal text-right"
              style={{ textAlign: 'right' }}
            >
              قسم الموظف
            </span>
          </div>
          <div className="w-full">
            <SearchableSelect
              value={department || ''}
              onChange={(value) =>
                setValue('department', value, { shouldValidate: true })
              }
              options={DEPARTMENT_OPTIONS}
              placeholder="اختر القسم"
              widthClass="w-full"
              error={errors?.department?.message}
              triggerClassName={`w-full bg-[rgba(234,234,234,0.25)] border px-3 py-2 text-lg ${errors?.department ? 'border-red-500' : 'border-black/16'
                } rounded text-right text-base font-normal`}
            />
          </div>
        </div>

        {/* Employee Name and Phone Number */}
        <div
          className="w-full flex flex-col md:flex-row items-start gap-6 md:gap-10"
          style={{ direction: 'rtl' }}
        >
          {/* Full Name */}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Briefcase
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                الاسم الكامل للموظف
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="fullName"
                type="text"
                placeholder="أدخل الاسم الكامل"
                register={register}
                error={errors.fullName?.message}
                className="!h-[46px] !px-4 !py-0 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Phone
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                رقم الهاتف
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="phoneNumber"
                type="text"
                placeholder="01234567890"
                register={register}
                registerOptions={{
                  // required: 'رقم الهاتف مطلوب',
                  validate: (val: string) =>
                    validateEgyptianPhoneNumber(val) ||
                    getPhoneNumberErrorMessage(val),
                }}
                error={errors.phoneNumber?.message}
                className="!h-[46px] !px-4 !py-0 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60"
              />
            </div>
          </div>
        </div>

        {/* Email and Address */}
        <div
          className="w-full flex flex-col md:flex-row items-start gap-6 md:gap-10"
          style={{ direction: 'rtl' }}
        >
          {/* البريد الإلكتروني */}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Mail
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                البريد الإلكتروني
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="email"
                type="email"
                placeholder="example@domain.com"
                register={register}
                registerOptions={{
                  required: 'البريد الإلكتروني مطلوب',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'البريد الإلكتروني غير صحيح',
                  },
                }}
                error={errors.email?.message}
                className="!h-[46px] !px-4 !py-0 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60"
              />
            </div>
          </div>

          {/* العنوان */}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <MapPin
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                العنوان
              </span>
            </div>
            <div className="w-full relative">
              <SearchableSelect
                value={address || ''}
                onChange={(v) =>
                  setValue('address', v, { shouldValidate: true })
                }
                options={governorates}
                placeholder="المحافظة"
                widthClass="w-full"
                error={errors.address?.message}
              />
              {errors.address && (
                <span
                  className="text-red-500 text-sm text-right mt-1 block"
                  style={{ textAlign: 'right' }}
                >
                  {errors.address.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Password And Password Confirmation */}
        <div
          className="w-full flex flex-col md:flex-row items-start gap-6 md:gap-10"
          style={{ direction: 'rtl' }}
        >
          {/* Password */}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Lock
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                كلمة المرور
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="password"
                type="password"
                placeholder="كلمة المرور"
                register={register}
                error={errors.password?.message}
                className="!h-[46px] !px-4 !pr-12 !py-0 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60"
              />
            </div>
          </div>

          {/* Password Confirmation*/}
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Lock
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right' }}
              >
                تأكيد كلمة المرور
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="confirmPassword"
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                register={register}
                error={errors.confirmPassword?.message}
                className="!h-[46px] !px-4 !pr-12 !py-0 bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div
          className="w-full flex flex-col md:flex-row items-start gap-6 md:gap-10"
          style={{ direction: 'rtl' }}
        >
          <div
            className="flex-1 w-full flex flex-col items-end gap-4"
            style={{ direction: 'rtl' }}
          >
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Clock
                className="w-6 h-6 text-primary flex-shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="text-base md:text-lg font-normal text-right"
                style={{ textAlign: 'right', direction: 'ltr' }}
              >
                ساعات العمل
              </span>
            </div>
            <div className="w-full">
              <WorkHoursTimePicker
                value={workingHours || ''}
                onChange={(value) =>
                  setValue('workingHours', value, { shouldValidate: true })
                }
                error={errors.workingHours?.message}
                placeholder="9 : AM - 5 : PM"
              />
            </div>
          </div>
          <div className="flex-1 hidden md:block"></div>
        </div>
      </div>
    </div>
  );
}
