import { useLocation } from 'react-router';
import type { PageProps } from '@/routes/pages';
import { NotFoundPage } from '@/routes/StatusPages';
import { RoleEditorPage } from './RoleEditorPage';
import { RoleListPage } from './RoleListPage';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Role management: `<base>` lists roles, `<base>/new` and `<base>/<id>` open the editor. */
export default function RolesPage({ basePath }: PageProps) {
  const { pathname } = useLocation();
  const rest = pathname.slice(basePath.length).replace(/^\/+|\/+$/g, '');
  if (rest === '') return <RoleListPage basePath={basePath} />;
  if (rest === 'new') return <RoleEditorPage key="new" basePath={basePath} />;
  if (UUID.test(rest)) return <RoleEditorPage key={rest} basePath={basePath} roleId={rest} />;
  return <NotFoundPage />;
}
