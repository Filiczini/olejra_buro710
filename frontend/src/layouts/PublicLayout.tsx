import { useEffect } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const transparent = matches.some(
    (m) => (m.handle as { transparentHeader?: boolean } | undefined)?.transparentHeader
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <>
      <Header transparent={transparent} />
      <Outlet />
      <Footer />
    </>
  );
}
