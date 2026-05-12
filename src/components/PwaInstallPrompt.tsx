import { useTranslation } from 'react-i18next';
import { useInstallStore, isIOS } from '../store/installStore';
import { isStandalone } from '../lib/isStandalone';

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const { showInstallPrompt, dismissInstall } = useInstallStore();

  if (isStandalone || !showInstallPrompt) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-end justify-center pb-24">
      <div className="bg-white rounded-t-2xl w-full max-w-sm p-6 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📲</span>
          <div>
            <p className="text-sm font-medium">{t('pwa.installTitle')}</p>
            <p className="text-xs text-gray-500">{t('pwa.installDesc')}</p>
          </div>
        </div>
        <ol className="text-sm space-y-3 mb-4 text-gray-700">
          {isIOS ? (
            <>
              <li>1. {t('pwa.iosStep1')}</li>
              <li>2. {t('pwa.iosStep2')}</li>
              <li>3. {t('pwa.iosStep3')}</li>
            </>
          ) : (
            <>
              <li>1. {t('pwa.androidStep1')}</li>
              <li>2. {t('pwa.androidStep2')}</li>
              <li>3. {t('pwa.androidStep3')}</li>
            </>
          )}
        </ol>
        <button onClick={dismissInstall}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg">
          {t('pwa.gotIt')}
        </button>
      </div>
    </div>
  );
}
