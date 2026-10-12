'use client';

import { LiaEditSolid, LiaEyeSolid, LiaLockSolid, LiaTrashSolid, LiaUndoSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { cn } from '@/lib/utils';
import { PERMISSIONS } from '@/lib/permissions';
import type { MerchantRoleSummary } from '@/lib/api/authorization';

interface RolesTableProps {
  roles: MerchantRoleSummary[];
  onEdit: (role: MerchantRoleSummary) => void;
  onDelete: (role: MerchantRoleSummary) => void;
  onReset: (role: MerchantRoleSummary) => void;
}

interface RoleActionsProps {
  role: MerchantRoleSummary;
  onEdit: (role: MerchantRoleSummary) => void;
  onDelete: (role: MerchantRoleSummary) => void;
  onReset: (role: MerchantRoleSummary) => void;
  buttonClassName?: string;
}

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

function RoleTypeBadge({ role }: { role: MerchantRoleSummary }) {
  if (role.isSystem) {
    return (
      <Badge className="bg-amber-100 text-amber-700">
        <LiaLockSolid className="size-3" />
        دور أساسي
      </Badge>
    );
  }
  if (role.templateKey !== null) {
    return <Badge className="bg-purple-100 text-purple-700">من قالب</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700">دور مخصص</Badge>;
}

function RoleActions({
  role,
  onEdit,
  onDelete,
  onReset,
  buttonClassName,
}: RoleActionsProps) {
  if (role.isSystem) {
    return (
      <Button
        size="sm"
        variant="outline"
        className={buttonClassName}
        onClick={() => onEdit(role)}
      >
        <LiaEyeSolid className="ml-1 size-4" />
        عرض الصلاحيات
      </Button>
    );
  }

  return (
    <>
      <Can code={PERMISSIONS.ROLES_UPDATE}>
        <Button
          size="sm"
          variant="outline"
          className={buttonClassName}
          onClick={() => onEdit(role)}
        >
          <LiaEditSolid className="ml-1 size-4" />
          تعديل
        </Button>
      </Can>
      {role.templateKey !== null && (
        <Can code={PERMISSIONS.ROLES_UPDATE}>
          <Button
            size="sm"
            variant="outline"
            className={buttonClassName}
            onClick={() => onReset(role)}
          >
            <LiaUndoSolid className="ml-1 size-4" />
            إعادة للقالب
          </Button>
        </Can>
      )}
      <Can code={PERMISSIONS.ROLES_DELETE}>
        <Button
          size="sm"
          variant="outline"
          className={cn('text-red-600 hover:bg-red-50', buttonClassName)}
          onClick={() => onDelete(role)}
        >
          <LiaTrashSolid className="ml-1 size-4" />
          حذف
        </Button>
      </Can>
    </>
  );
}

export function RolesTable({ roles, onEdit, onDelete, onReset }: RolesTableProps) {
  return (
    <>
      <ul className="space-y-3 md:hidden" aria-label="الأدوار">
        {roles.map((role) => (
          <li
            key={role.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words font-semibold text-gray-900">
                {role.name}
              </p>
              <div className="shrink-0">
                <RoleTypeBadge role={role} />
              </div>
            </div>
            <p className="mt-1 line-clamp-2 break-words text-sm text-gray-600">
              {role.description || '—'}
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <dt className="text-gray-500">عدد الصلاحيات:</dt>
                <dd className="tabular-nums font-medium text-gray-800">
                  {role.permissionCodes.length}
                </dd>
              </div>
              <div className="flex items-center gap-1">
                <dt className="text-gray-500">الموظفون:</dt>
                <dd className="tabular-nums font-medium text-gray-800">
                  {role.assigneeCount}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <RoleActions
                role={role}
                onEdit={onEdit}
                onDelete={onDelete}
                onReset={onReset}
                buttonClassName="h-10 sm:h-10 flex-1 basis-[calc(50%-0.25rem)]"
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                الدور
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                الوصف
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                عدد الصلاحيات
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                الموظفون
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                النوع
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
              >
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {role.name}
                </td>
                <td className="max-w-[280px] truncate px-4 py-2.5 text-gray-600">
                  {role.description || '—'}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-gray-700">
                  {role.permissionCodes.length}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-gray-700">
                  {role.assigneeCount}
                </td>
                <td className="px-4 py-2.5">
                  <RoleTypeBadge role={role} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <RoleActions
                      role={role}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReset={onReset}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
