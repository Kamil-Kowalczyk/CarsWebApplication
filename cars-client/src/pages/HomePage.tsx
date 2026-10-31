import { Link } from 'react-router';

export const HomePage = () => {
  return (
    <div className="page-container home-page">
      <div className="card hero-card">
        <h1>Cars Fleet </h1>
        <p className="hero-description">
          A React application for browsing, adding, editing and managing
          your car fleet.
        </p>
        <div className="hero-buttons">
          <Link to="/cars" className="btn btn-primary">
            Browse Cars Fleet
          </Link>
          <Link to="/cars/new" className="btn btn-secondary">
            + Add New Car
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;