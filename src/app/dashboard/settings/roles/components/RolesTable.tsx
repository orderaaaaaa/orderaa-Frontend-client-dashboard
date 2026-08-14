'use client';

import { LiaEditSolid, LiaEyeSolid, LiaLockSolid, LiaTrashSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import type { MerchantRoleSummary } from '@/lib/api/authorization';

interface RolesTableProps {
  roles: MerchantRoleSummary[];
  onEdit: (role: MerchantRoleSummary) => void;
  onDelete: (role: MerchantRoleSummary) => void;
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

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  return (
    <div className="overflow-x-auto">
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
                {role.isSystem ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    <LiaLockSolid className="size-3" />
                    دور أساسي
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700">دور مخصص</Badge>
                )}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {/* System roles are readable by anyone who can list roles,
                      but never editable — the backend answers 403. */}
                  {role.isSystem ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(role)}
                    >
                      <LiaEyeSolid className="ml-1 size-4" />
                      عرض الصلاحيات
                    </Button>
                  ) : (
                    <>
                      <Can code={PERMISSIONS.ROLES_UPDATE}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(role)}
                        >
                          <LiaEditSolid className="ml-1 size-4" />
                          تعديل
                        </Button>
                      </Can>
                      <Can code={PERMISSIONS.ROLES_DELETE}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(role)}
                        >
                          <LiaTrashSolid className="ml-1 size-4" />
                          حذف
                        </Button>
                      </Can>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
