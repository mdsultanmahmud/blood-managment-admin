import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { staffApi } from '@/api/modules/staff';
import type { AutocompleteOption } from '@/components/form/FormAutocomplete';
import { useAuth } from '@/context/authState';
import { queryKeys } from '@/lib/queryClient';

/** Every role of the app, as picker options (from the staff API, so Roles access is not needed). */
export function useRoleOptions(): { options: AutocompleteOption[]; loading: boolean } {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const q = useQuery({
    queryKey: [...queryKeys.staff, 'roles'],
    queryFn: staffApi.roles,
  });
  // Only an Admin may give the Admin role; the server refuses other roles whose access the
  // signed-in user lacks (PERMISSION_ESCALATION), shown as a message.
  const options = (q.data ?? []).map((r) => {
    const disabled = r.isLocked && !isAdmin;
    return {
      value: r.id,
      label: r.name,
      disabled,
      ...(disabled ? { description: t('staff.form.adminOnly') } : {}),
    };
  });
  return { options, loading: q.isPending };
}
