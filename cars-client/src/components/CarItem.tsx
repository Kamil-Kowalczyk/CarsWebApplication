import { BodyTypeLabels, FuelTypeLabels, type Car } from "../models/Car"

export interface CarItemProps {
    car: Car
    handleDetails: (id: string) => void
    handleEdit: (id: string) => void
    handleDelete: (id: string) => void
}

export const CarItem = ({car, handleDetails, handleEdit, handleDelete}: CarItemProps) => {
    return (
         <div key={car.id} className="car-item card">
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