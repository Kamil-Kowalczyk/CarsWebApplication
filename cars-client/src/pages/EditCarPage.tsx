import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { Car, NewCar } from '../models/Car';
import { getCarById, updateCar } from '../services/carService';
import CarForm from '../components/CarForm';

export const EditCarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController()

    const fetchCar = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const fetchedCar = await getCarById(id, controller.signal);
        setCar(fetchedCar);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load car details for editing.');
        }
      } finally {
        if (controller.signal.aborted) return
        setIsLoading(false);
      }
    };

    fetchCar();

    return () => {
      controller.abort()
    }
  }, [id]);

  const handleUpdate = async (carData: NewCar) => {
    if (!id) return;
    await updateCar(id, carData);
    navigate(`/cars/${id}`);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading car data for editing...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <h3>Error</h3>
          <p>{error || 'Car not found.'}</p>
        </div>
        <Link to="/cars" className="btn btn-secondary">
          Back to Cars List
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card form-card">
        <h2>
          Edit Car: {car.brand} {car.model}
        </h2>
        <p className="card-subtitle">
          Update the fields below and submit to save changes.
        </p>
        <CarForm
          key={car.id}
          initialValues={car}
          onSubmit={handleUpdate}
          submitButtonText="Save Changes"
          onCancel={() => navigate(`/cars/${car.id}`)}
        />
      </div>
    </div>
  );
};

export default EditCarPage;