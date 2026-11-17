import { Link } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

export const HomePage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="page-container home-page">
      <div className="card hero-card">
        <h1>Cars Fleet </h1>
        <p className="hero-description">
          A React application for browsing, adding, editing and managing
          your car fleet.
        </p>
        <div className="hero-buttons">
          {user && <Link to="/cars" className="btn btn-primary">
            Browse Cars Fleet
          </Link>}
          {user && <Link to="/cars/new" className="btn btn-secondary">
            + Add New Car
          </Link>}
          {!user && <Link to="/login" className="btn btn-primary">Already have an account?</Link>}
          {!user && <Link to="/register" className="btn btn-secondary">Want to register?</Link>}
        </div>
      </div>
    </div>
  );
};

export default HomePage;