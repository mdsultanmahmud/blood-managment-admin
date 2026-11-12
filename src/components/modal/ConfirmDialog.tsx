import { useTranslation } from 'react-i18next';
import { useCurrentModal, type ConfirmOptions } from '@/context/modalTypes';
import { Button } from '../ui/Button';
import { ModalBody, ModalFooter } from './ModalHost';

/** Body of confirm(); resolves true on confirm, false/undefined otherwise. */
export function ConfirmDialogContent({
  message,
  confirmLabel,
  cancelLabel,
  tone = 'default',
}: ConfirmOptions) {
  const { t } = useTranslation();
  const { close } = useCurrentModal<boolean>();
  return (
    <>
      {message && (
        <ModalBody>
          <div className="text-sm leading-relaxed text-neutral-700">{message}</div>
        </ModalBody>
      )}
      <ModalFooter>
        <Button variant="ghost" onClick={() => close(false)}>
          {cancelLabel ?? t('common.actions.cancel')}
        </Button>
        <Button
          data-autofocus
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => close(true)}
        >
          {confirmLabel ?? t('common.actions.confirm')}
        </Button>
      </ModalFooter>
    </>
  );
}
