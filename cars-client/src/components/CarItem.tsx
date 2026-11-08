import { BodyTypeLabels, FuelTypeLabels, type Car } from "../models/Car"
import { useCarUiStore } from "../store/useCarUiStore"

export interface CarItemProps {
    car: Car
    handleDetails: (id: string) => void
    handleEdit: (id: string) => void
    handleDelete: (id: string) => void
}

export const CarItem = ({
    car,
    handleDetails,
    handleEdit,
    handleDelete,
}: CarItemProps) => {
    const isLiked = useCarUiStore(
      (state) => state.favoriteCarIds.includes(car.id)
    )

    const storeHandleLike = useCarUiStore(
      (state) => state.toggleFavorite
    )

    const handleLike = (id: string) => {
      storeHandleLike(id)
    }

    return (
         <div className="car-item card">
              <div className="car-info">
                <h3>
                  {car.brand} {car.model}
                </h3>
                <div className="car-tags">
                  <span className="badge">
                    {FuelTypeLabels[car.fuelType] ?? 'Fuel'}
                  </span>
                  <span className="badge">
                    {BodyTypeLabels[car.bodyType] ?? 'Body'}
                  </span>
                  <span className="badge">{car.engineCapacity} cm³</span>
                  <span className="badge">{car.productionDate}</span>
                </div>
              </div>
              <div className="car-actions">
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
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDetails(car.id)}
                >
                  Details
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleEdit(car.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(car.id)}
                >
                  Delete
                </button>
              </div>
            </div>
    )
}

export default CarItem