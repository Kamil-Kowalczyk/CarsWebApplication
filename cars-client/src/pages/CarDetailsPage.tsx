import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { FuelTypeLabels, BodyTypeLabels } from '../models/Car';
import { getCarById, deleteCar, deleteCarPhoto } from '../services/carService';
import { useCarUiStore } from '../store/useCarUiStore';
import { useAuthStore } from '../store/useAuthStore';
import { queryKeys } from '../queries/queryKey';
import { CarPhotoUpload } from '../components/CarPhotoUpload';

export const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const carId = id ?? '';

  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.roles.includes('Admin') ?? false;

  const favoriteCarIdsByUser = useCarUiStore(
    (state) => state.favoriteCarIdsByUser,
  );

  const toggleFavorite = useCarUiStore((state) => state.toggleFavorite);

  const favoriteCarIds = user ? (favoriteCarIdsByUser[user.id] ?? []) : [];

  const {
    data: car,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.car(carId),
    queryFn: () => getCarById(carId),
    enabled: Boolean(id),
  });

  const removeLiked = useCarUiStore((state) => state.removeFavorite);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this car?');
    if (confirmed) {
      try {
        await deleteCar(id);
        if (user) {
          removeLiked(user.id, id);
        }
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

  const deletePhotoMutation = useMutation({
    mutationFn: ({ photoId }: { photoId: string }) =>
      deleteCarPhoto(carId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) });
    },
  });

  if (!id) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <p>No car ID provided.</p>
        </div>
        <Link to="/cars" className="btn btn-secondary">
          Back to Cars List
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading car details...</p>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <h3>Error loading car</h3>
          <p>{error?.message}</p>
        </div>
        <Link to="/cars" className="btn btn-secondary">
          Back to Cars List
        </Link>
      </div>
    );
  }

  const isLiked = favoriteCarIds.includes(car.id);

  const handleLike = () => {
    if (user) toggleFavorite(user.id, car.id);
  };

  const mainPhoto =
    car.photos?.find((p) => p.isMain) ?? car.photos?.[0] ?? null;

  return (
    <div className="page-container">
      <div className="card details-card">
        <div className="details-header">
          <h2>
            {car.brand} {car.model}
          </h2>
        </div>

        {/* Main photo */}
        {mainPhoto && (
          <div className="car-main-photo">
            <img
              src={mainPhoto.url}
              alt={`${car.brand} ${car.model}`}
              className="car-main-photo-img"
            />
          </div>
        )}

        {/* Details grid */}
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

        {/* Features */}
        {car.features && car.features.length > 0 && (
          <div className="details-features">
            <h3 className="details-section-title">Features</h3>
            <div className="features-badges">
              {car.features.map((feature) => (
                <span key={feature.id} className="badge">
                  {feature.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photo gallery */}
        {car.photos && car.photos.length > 0 && (
          <div className="details-gallery">
            <h3 className="details-section-title">Photos</h3>
            {deletePhotoMutation.isError && (
              <p className="form-error">
                Failed to delete photo: {deletePhotoMutation.error?.message}
              </p>
            )}
            <div className="gallery-grid">
              {car.photos.map((photo) => (
                <div key={photo.id} className="gallery-item">
                  <img
                    src={photo.url}
                    alt={`${car.brand} ${car.model}`}
                    className="gallery-img"
                  />
                  {photo.isMain && (
                    <span className="badge badge-main">Main</span>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        deletePhotoMutation.mutate({ photoId: photo.id })
                      }
                      disabled={deletePhotoMutation.isPending}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo upload (admin only) */}
        { <CarPhotoUpload carId={car.id} />}

        {/* Actions */}
        <div className="details-actions">
          {user && (
            <button
              type="button"
              className={`btn-like ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={isLiked ? 'Unlike' : 'Like'}
              aria-label="Like"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="heart-icon"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          )}
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
          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;