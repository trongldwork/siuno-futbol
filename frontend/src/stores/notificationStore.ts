import { create } from 'zustand';
import toast from 'react-hot-toast';

interface NotificationState {
  // Toast notifications
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId: string) => void;
}

export const useNotificationStore = create<NotificationState>(() => ({
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 3500,
      position: 'top-right',
      icon: '⚠️',
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
}));
