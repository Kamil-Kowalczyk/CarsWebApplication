import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { Car } from '../models/Car';
import { FuelTypeLabels, BodyTypeLabels } from '../models/Car';
import { getCarById, deleteCar } from '../services/carService';
import axios from "axios";
import { useCarUiStore } from '../store/useCarUiStore';

export const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const removeLiked = useCarUiStore(
      (state) => state.removeFavorite
    )

  const isLiked = id ? useCarUiStore(
      (state) => state.favoriteCarIds.includes(id)
    ) : false

  const storeHandleLike = useCarUiStore(
    (state) => state.toggleFavorite
  )

  const handleLike = (id: string) => {
    storeHandleLike(id)
    }

  useEffect(() => {
    const controller = new AbortController()


    const fetchDetails = async () => {
      if (!id) return

      setIsLoading(true);
      setError('');
      try {
        const carDetails = await getCarById(id, controller.signal);
        setCar(carDetails);
      } catch (err: unknown) {
        if (axios.isCancel(err)) return

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch car details.');
        }
      } finally {
        if (controller.signal.aborted) return
        setIsLoading(false);
      }
    };

    fetchDetails();

    return () => {
        controller.abort()
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this car?'
    );

    if (confirmed) {
      try {
        await deleteCar(id);
        removeLiked(id)
        navigate('/cars');
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(`Failed to delete car: ${err.message}`);
        } else {
          alert('Failed to delete car.');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading car details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <h3>Error loading car</h3>
          <p>{error}</p>
        </div>
        <Link to="/cars" className="btn btn-secondary">
          Back to Cars List
        </Link>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="card details-card">
        <div className="details-header">
          <h2>
            {car.brand} {car.model}
          </h2>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Brand:</span>
            <span className="detail-value">{car.brand}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Model:</span>
            <span className="detail-value">{car.model}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Doors:</span>
            <span className="detail-value">{car.doorsNumber}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Luggage Capacity:</span>
            <span className="detail-value">{car.luggageCapacity} L</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Engine Capacity:</span>
            <span className="detail-value">{car.engineCapacity} cm³</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Fuel Type:</span>
            <span className="detail-value">
              {FuelTypeLabels[car.fuelType] ?? car.fuelType}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Body Type:</span>
            <span className="detail-value">
              {BodyTypeLabels[car.bodyType] ?? car.bodyType}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Production Date:</span>
            <span className="detail-value">{car.productionDate}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Avg. Fuel Consumption:</span>
            <span className="detail-value">
              {car.averageFuelConsumption} L/100km
            </span>
          </div>
        </div>

        <div className="details-actions">
          <button
                  type="button"
                  className={`btn-like ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike?.(car.id)}
                  title={isLiked ? "Unlike" : "Like"}
                  aria-label="Like"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="heart-icon"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/cars')}
          >
            Back to List
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/cars/${car.id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;