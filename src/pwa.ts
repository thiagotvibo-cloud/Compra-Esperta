import { registerSW } from 'virtual:pwa-register';

export const setupPWA = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Nova versão disponível. Deseja atualizar?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App pronto para funcionar offline');
    },
  });
};
