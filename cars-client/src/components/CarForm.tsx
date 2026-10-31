import { useState } from 'react';
import type { NewCar } from '../models/Car';
import { FuelType, BodyType, FuelTypeLabels, BodyTypeLabels } from '../models/Car';

interface CarFormProps {
  initialValues?: Partial<NewCar>;
  onSubmit: (car: NewCar) => Promise<void>;
  submitButtonText?: string;
  onCancel?: () => void;
}

export const CarForm = ({
  initialValues,
  onSubmit,
  submitButtonText = 'Save',
  onCancel
}: CarFormProps) => {
  const [formData, setFormData] = useState<NewCar>({
    brand: initialValues?.brand ?? '',
    model: initialValues?.model ?? '',
    doorsNumber: initialValues?.doorsNumber ?? 5,
    luggageCapacity: initialValues?.luggageCapacity ?? 450,
    engineCapacity: initialValues?.engineCapacity ?? 1600,
    fuelType: initialValues?.fuelType ?? FuelType.Petrol,
    productionDate: initialValues?.productionDate ?? new Date().toISOString().split('T')[0],
    averageFuelConsumption: initialValues?.averageFuelConsumption ?? 6.0,
    bodyType: initialValues?.bodyType ?? BodyType.Sedan
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' || name === 'fuelType' || name === 'bodyType'
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="car-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input
            id="brand"
            name="brand"
            type="text"
            required
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. Toyota"
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            id="model"
            name="model"
            type="text"
            required
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g. Corolla"
          />
        </div>

        <div className="form-group">
          <label htmlFor="doorsNumber">Doors Number *</label>
          <input
            id="doorsNumber"
            name="doorsNumber"
            type="number"
            min={1}
            max={10}
            required
            value={formData.doorsNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="luggageCapacity">Luggage Capacity (L) *</label>
          <input
            id="luggageCapacity"
            name="luggageCapacity"
            type="number"
            min={0}
            required
            value={formData.luggageCapacity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="engineCapacity">Engine Capacity (cm³) *</label>
          <input
            id="engineCapacity"
            name="engineCapacity"
            type="number"
            min={0}
            required
            value={formData.engineCapacity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type *</label>
          <select
            id="fuelType"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
          >
            {Object.entries(FuelTypeLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="productionDate">Production Date *</label>
          <input
            id="productionDate"
            name="productionDate"
            type="date"
            required
            value={formData.productionDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="averageFuelConsumption">
            Avg. Fuel Consumption (L/100km) *
          </label>
          <input
            id="averageFuelConsumption"
            name="averageFuelConsumption"
            type="number"
            step="0.1"
            min={0}
            required
            value={formData.averageFuelConsumption}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bodyType">Body Type *</label>
          <select
            id="bodyType"
            name="bodyType"
            value={formData.bodyType}
            onChange={handleChange}
          >
            {Object.entries(BodyTypeLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CarForm;
