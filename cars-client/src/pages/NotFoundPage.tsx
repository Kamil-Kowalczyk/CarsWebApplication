import { Link } from 'react-router';

export const NotFoundPage = () => {
  return (
    <div className="page-container not-found-page">
      <div className="card">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/cars" className="btn btn-primary">
            Back to Cars List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;