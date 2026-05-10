import { Outlet, useMatches } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  const matches = useMatches();
  const transparent = matches.some(
    (m) => (m.handle as { transparentHeader?: boolean } | undefined)?.transparentHeader
  );

  return (
    <>
      <Header transparent={transparent} />
      <Outlet />
      <Footer />
    </>
  );
}
