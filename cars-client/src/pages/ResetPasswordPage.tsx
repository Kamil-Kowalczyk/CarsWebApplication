import {
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import { Link, useSearchParams } from 'react-router';
import { resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setNewPassword(event.target.value);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !token) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const result = await resetPassword(email, token, newPassword);
      setMessage(result || 'Your password has been changed successfully!');
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          'Failed to reset password. Please try again or request a new reset link.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="page-container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h2>Invalid Reset Link</h2>
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            <p>
              The password reset link is invalid, incomplete, or has expired.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="btn btn-primary">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="page-container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h2>Password Reset Successful</h2>
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <p>{message}</p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="btn btn-primary">
              Sign In with New Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card auth-card">
        <h2>Reset Password</h2>
        <p className="card-subtitle">
          Enter a new password for account: <strong>{email}</strong>
        </p>

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving new password...' : 'Update Password'}
          </button>
        </form>

        <div className="auth-footer-links" style={{ textAlign: 'center' }}>
          <p>
            Remembered your password?{' '}
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}