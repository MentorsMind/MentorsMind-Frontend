import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, MAIN_NAVIGATION } from '../config/routes.config';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME;
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const config = MAIN_NAVIGATION.find(n => n.path === url);
      return {
        label: config?.label || path.charAt(0).toUpperCase() + path.slice(1),
        path: url,
        isLast: index === paths.length - 1,
      };
    });

    if (location.pathname !== ROUTES.HOME) {
      breadcrumbs.unshift({ label: 'Home', path: ROUTES.HOME, isLast: false });
    }

    return breadcrumbs;
  };

  return {
    location,
    navigate,
    isActive,
    breadcrumbs: getBreadcrumbs(),
  };
};
