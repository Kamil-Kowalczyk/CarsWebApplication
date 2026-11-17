import {
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import { Link } from 'react-router';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await forgotPassword(email);
      setMessage(
        result ||
          'If an account with that email exists, a password reset link has been sent to your inbox.',
      );
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          'Failed to send password reset link. Please check your email and try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card auth-card">
        <h2>Forgot Password</h2>
        <p className="card-subtitle">
          Enter your email address to receive a password reset link.
        </p>

        {message && (
          <div className="alert alert-success">
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
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