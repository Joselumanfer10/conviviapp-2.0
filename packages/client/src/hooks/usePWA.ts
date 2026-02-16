import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWA() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Comprobar actualizaciones cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Error al registrar SW:', error);
    },
  });

  function close() {
    setNeedRefresh(false);
  }

  return {
    needRefresh,
    updateServiceWorker,
    close,
  };
}
