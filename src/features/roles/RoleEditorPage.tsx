import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft } from 'react-icons/lu';
import { useBlocker, useNavigate } from 'react-router';
import { z } from 'zod';
import { toApiError } from '@/api/errors';
import { rolesApi, type Role } from '@/api/modules/roles';
import { FormTextField } from '@/components/form/FormTextField';
import { Button } from '@/components/ui/Button';
import { PageLayout, Section } from '@/components/ui/PageLayout';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { useModal } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { permissionKey } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryClient';
import { fromRole, heldBy, sameMatrix, toBody, type Matrix } from './matrix';
import { RoleMatrix } from './RoleMatrix';

const MENU = 'role_management';
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'validation.role.name.required')
    .max(80, 'validation.role.name.tooLong'),
});
type Values = z.infer<typeof schema>;
const EMPTY: Matrix = new Map();

/** Create or edit one role: name, then the menu matrix, saved from a sticky bar (as in BC). */
export function RoleEditorPage({ basePath, roleId }: { basePath: string; roleId?: string }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const { confirm } = useModal();
  const queryClient = useQueryClient();
  const reduce = useReducedMotion();

  const tree = useQuery({ queryKey: queryKeys.accessMenus, queryFn: rolesApi.menus });
  const role = useQuery({
    queryKey: queryKeys.role(roleId ?? 'new'),
    queryFn: () => rolesApi.get(roleId ?? ''),
    enabled: Boolean(roleId),
  });
  const loaded: Role | undefined = role.data;
  const initial = useMemo(() => (loaded ? fromRole(loaded.menus) : EMPTY), [loaded]);
  // Edits on top of the loaded role; null means unchanged.
  const [edited, setMatrix] = useState<Matrix | null>(null);
  const matrix = edited ?? initial;

  const { control, handleSubmit, reset, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  useEffect(() => {
    if (loaded) reset({ name: loaded.name });
  }, [loaded, reset]);

  const locked = loaded?.isLocked ?? false;
  const canEdit = !locked && auth.can(permissionKey(MENU, roleId ? 'update' : 'create'));
  const { isAdmin, can, navigation } = auth;
  const held = useMemo(() => heldBy({ isAdmin, can, navigation }), [isAdmin, can, navigation]);
  const dirty = formState.isDirty || !sameMatrix(matrix, initial);

  const save = useMutation({
    mutationFn: (v: Values) => {
      const body = { name: v.name, menus: toBody(matrix) };
      return roleId ? rolesApi.update(roleId, body) : rolesApi.create(body);
    },
  });

  // Set once a new role is saved; the effect below then opens it without the leave prompt.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !createdId &&
      canEdit &&
      dirty &&
      !save.isPending &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    void confirm({
      title: t('common.dirty.title'),
      message: t('roles.editor.leave'),
      confirmLabel: t('common.actions.discard'),
      cancelLabel: t('common.actions.keepEditing'),
      tone: 'danger',
    }).then((ok) => (ok ? blocker.proceed() : blocker.reset()));
  }, [blocker, confirm, t]);
  useEffect(() => {
    if (createdId) void navigate(`${basePath}/${createdId}`, { replace: true });
  }, [createdId, navigate, basePath]);

  const onSave = handleSubmit(async (values) => {
    try {
      const saved = await save.mutateAsync(values);
      queryClient.setQueryData(queryKeys.role(saved.id), saved);
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.roles, 'list'] });
      // The editor's own access changes when they edit a role they hold.
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      reset({ name: saved.name });
      setMatrix(null);
      if (roleId) notify.success(t('roles.editor.saved'));
      else {
        notify.success(t('roles.editor.created'));
        setCreatedId(saved.id);
      }
    } catch (err) {
      if (toApiError(err).code === 'ROLE_NAME_TAKEN') {
        setError('name', { message: 'errors.ROLE_NAME_TAKEN' });
      } else notify.error(userMessage(err));
    }
  });

  if (tree.isPending || (roleId && role.isPending)) return <LoadingState />;
  const failed = tree.error ?? role.error;
  if (failed || !tree.data) {
    return (
      <ErrorState
        title={t('status.loadFailed.title')}
        message={userMessage(failed)}
        onRetry={() => {
          void tree.refetch();
          if (roleId) void role.refetch();
        }}
      />
    );
  }

  return (
    <PageLayout
      title={loaded ? loaded.name : t('roles.editor.newTitle')}
      description={locked ? t('roles.editor.lockedHelp') : undefined}
      actions={
        <Button variant="ghost" icon={<LuArrowLeft />} onClick={() => void navigate(basePath)}>
          {t('roles.editor.back')}
        </Button>
      }
    >
      <form onSubmit={(e) => void onSave(e)} className="flex flex-col gap-6" noValidate>
        <Section title={t('roles.editor.details')}>
          <div className="max-w-md">
            <FormTextField
              control={control}
              name="name"
              label={t('roles.editor.name')}
              disabled={!canEdit}
            />
          </div>
        </Section>

        <section aria-labelledby="role-access">
          <h2 id="role-access" className="text-[15px] font-semibold text-neutral-900">
            {t('roles.editor.access')}
          </h2>
          <p className="mt-0.5 mb-3 text-[13px] text-neutral-600">{t('roles.editor.accessHelp')}</p>
          {tree.data.length === 0 ? (
            <p className="text-sm text-neutral-600">{t('roles.matrix.empty')}</p>
          ) : (
            <RoleMatrix
              tree={tree.data}
              value={matrix}
              onChange={setMatrix}
              held={held}
              readOnly={!canEdit}
            />
          )}
        </section>

        <AnimatePresence>
          {canEdit && (dirty || !roleId) && (
            <motion.div
              initial={reduce ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.16 }}
              className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-surface px-4 py-3 shadow-layer"
            >
              <p className="text-sm text-neutral-700" aria-live="polite">
                {roleId ? t('roles.editor.unsaved') : t('roles.editor.notSaved')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (roleId) {
                      reset();
                      setMatrix(null);
                    } else void navigate(basePath);
                  }}
                >
                  {roleId ? t('roles.editor.discard') : t('roles.editor.cancel')}
                </Button>
                <Button type="submit" variant="primary" loading={save.isPending}>
                  {roleId ? t('roles.editor.save') : t('roles.editor.create')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </PageLayout>
  );
}
