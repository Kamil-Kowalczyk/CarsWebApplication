import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';

export const RootLayout = () => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;