import {
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import { Link, useNavigate } from 'react-router';
import { register } from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupShown, setIsPopupShown] = useState(false);

  function handleUserNameChange(event: ChangeEvent<HTMLInputElement>) {
    setUserName(event.target.value);
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await register({
        userName,
        email,
        password,
      });

      setIsPopupShown(true);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          'Failed to create account. Please check your details and try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card auth-card">
        <h2>Create an Account</h2>
        <p className="card-subtitle">
          Register to manage and browse your cars fleet.
        </p>

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Username</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create a secure password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>

      {isPopupShown && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-icon">✉️</div>
            <h2 className="modal-title">Confirm Your Email</h2>
            <p className="modal-body">
              Your account has been created! A confirmation link has been sent
              to <strong>{email}</strong>. Please check your inbox and confirm
              your email address before logging in.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsPopupShown(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}