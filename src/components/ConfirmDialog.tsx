import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} className="relative z-[1002]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          <div className="p-6">
            <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
          <div className="flex gap-3 justify-end px-6 pb-6">
            <button onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Отмена
            </button>
            <button onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
