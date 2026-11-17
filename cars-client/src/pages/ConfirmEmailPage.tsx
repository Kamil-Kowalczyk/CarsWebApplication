import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { confirmEmail } from '../services/authService';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const isInvalidLink = !userId || !token;
  const [isLoading, setIsLoading] = useState(!isInvalidLink);
  const [message, setMessage] = useState(
    isInvalidLink
      ? 'The confirmation link is invalid or incomplete.'
      : 'Confirming your account...',
  );
  const [isSuccess, setIsSuccess] = useState<boolean | null>(
    isInvalidLink ? false : null,
  );

  useEffect(() => {
    if (!userId || !token) {
      return;
    }

    async function confirm() {
      try {
        setIsLoading(true);
        const result = await confirmEmail(userId!, token!);
        setMessage(result || 'Your email has been confirmed successfully!');
        setIsSuccess(true);
      } catch (err: unknown) {
        setIsSuccess(false);
        if (err instanceof Error) {
          setMessage(err.message || 'Failed to confirm account.');
        } else {
          setMessage(
            'Failed to confirm account. The link may have expired or is invalid.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    confirm();
  }, [userId, token]);

  return (
    <div className="page-container">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <h2>Email Confirmation</h2>

        {isLoading && (
          <div className="loading-container" style={{ margin: '1.5rem 0' }}>
            <p className="loading-text">Confirming your account...</p>
          </div>
        )}

        {!isLoading && isSuccess && (
          <div style={{ marginTop: '1rem' }}>
            <div className="alert alert-success">
              <p>{message}</p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="btn btn-primary">
                Proceed to Login
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !isSuccess && (
          <div style={{ marginTop: '1rem' }}>
            <div className="alert alert-error">
              <h3>Confirmation Failed</h3>
              <p>{message}</p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}