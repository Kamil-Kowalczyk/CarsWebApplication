import {
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router';
import {
  register,
} from '../services/authService';
import {
  useAuthStore,
} from '../store/useAuthStore';

export default function RegisterPage() {
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');

  const [userName, setUserName] = useState('')
  const [error, setError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

    const [isPopupShown, setIsPopupShown] = useState(false)

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setPassword(event.target.value);
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
        await register({
         userName,
          email,
          password,
        });

        setIsPopupShown(true)
    }
    catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      }
      else {
        setError(
          'The account could not be created.',
        );
      }
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Create an account</h1>
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
      <form
        className="car-form"
        onSubmit={handleSubmit}
      >
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>
        <label>
          Hasło
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Creating the account...'
            : 'Register'}
        </button>
      </form>
      <p>
        Do you have already an account?{' '}
        <Link to="/login">
          Login
        </Link>
      </p>
    </section>
  );
}