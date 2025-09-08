import React from 'react';
import { X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'boy' | 'girl';
  hideCancelButton?: boolean;
  onCancel?: () => void;
  adminStyle?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  hideCancelButton = false,
  onCancel,
  adminStyle = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getVariantStyles = () => {
    if (adminStyle) {
      switch (variant) {
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 text-white';
        case 'success':
          return 'bg-emerald-600 hover:bg-emerald-700 text-white';
        case 'warning':
          return 'bg-amber-500 hover:bg-amber-600 text-white';
        case 'boy':
          return 'bg-blue-600 hover:bg-blue-700 text-white';
        case 'girl':
          return 'bg-pink-500 hover:bg-pink-600 text-white';
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white';
      }
    } else {
      switch (variant) {
        case 'danger':
          return 'bg-red-500 hover:bg-red-600 text-white';
        case 'success':
          return 'bg-green-500 hover:bg-green-600 text-white';
        case 'warning':
          return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        case 'boy':
          return 'bg-blue-500 hover:bg-blue-600 text-white';
        case 'girl':
          return 'bg-pink-500 hover:bg-pink-600 text-white';
        default:
          return 'bg-blue-500 hover:bg-blue-600 text-white';
      }
    }
  };

  const dialogPanelClasses = adminStyle
    ? 'bg-slate-800 border border-slate-700 text-white'
    : 'bg-white';

  const titleClasses = adminStyle
    ? 'text-white'
    : 'text-gray-900';

  const messageClasses = adminStyle
    ? 'text-slate-300'
    : 'text-gray-600';

  const closeButtonClasses = adminStyle
    ? 'text-slate-400 hover:text-white'
    : 'text-gray-400 hover:text-gray-500';

  const cancelButtonClasses = adminStyle
    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 focus:ring-offset-slate-800'
    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-offset-white';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={handleCancel}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-xl ${dialogPanelClasses}`}>
              <button
                onClick={onClose}
                className={`absolute right-4 top-4 transition-colors ${closeButtonClasses}`}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <Dialog.Title
                as="h3"
                className={`text-lg font-medium leading-6 mb-2 ${titleClasses}`}
              >
                {title}
              </Dialog.Title>

              <div className={`mt-4 text-sm whitespace-pre-line ${messageClasses}`}>
                {message.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>

              <div className={`mt-6 ${hideCancelButton ? 'flex justify-end' : 'flex flex-col sm:flex-row justify-end gap-3'}`}>
                {!hideCancelButton && (
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto ${cancelButtonClasses}`}
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  type="button"
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto ${getVariantStyles()}`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationDialog;
