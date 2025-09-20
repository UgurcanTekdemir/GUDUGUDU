import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from '@/hooks/useI18n';

const NotFound = () => {
  const { t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('pages.notFound.title', 'Page Not Found')}</p>
        <p className="text-gray-500 mb-6">{t('pages.notFound.subtitle', 'The page you\'re looking for doesn\'t exist')}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('common.returnHome', 'Return to Home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
