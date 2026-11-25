import type { CarFormValues } from '../models/CarFormValues';
import { FuelType, BodyType, FuelTypeLabels, BodyTypeLabels, type Car } from '../models/Car';
import { useQuery } from "@tanstack/react-query"
import { useForm } from 'react-hook-form';
import { getFeatures } from '../services/carService';
import { queryKeys } from '../queries/queryKey';


interface CarFormProps {
  initialValues?: Car;
  onSubmit: (car: CarFormValues) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const CarForm = ({
  initialValues,
  onSubmit,
  submitButtonText = 'Save',
  isSubmitting = false,
  onCancel
}: CarFormProps) => {
  // =========================================================
  // TANSTACK QUERY -- FEATURES
  // =========================================================
  const { data: features = [], isPending: featuresPending } = useQuery({
    queryKey: queryKeys.features,
    queryFn: ({ signal }) => getFeatures(signal),
  });


  // =========================================================
  // REACT HOOK FORM
  // =========================================================
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormValues>({
    defaultValues: {
      brand: initialValues?.brand ?? '',
      model: initialValues?.model ?? '',
      doorsNumber: initialValues?.doorsNumber ?? 5,
      luggageCapacity: initialValues?.luggageCapacity ?? 450,
      engineCapacity: initialValues?.engineCapacity ?? 1600,
      fuelType: initialValues?.fuelType ?? FuelType.Petrol,
      productionDate: initialValues?.productionDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      averageFuelConsumption: initialValues?.averageFuelConsumption ?? 6.0,
      bodyType: initialValues?.bodyType ?? BodyType.Sedan,
      featureIds: initialValues?.features.map((v) => v.id) ?? []
    },
  });

  console.log(initialValues)


  // =========================================================
  // SUBMIT
  // =========================================================
  function handleFormSubmit(values: CarFormValues) {
    onSubmit(values)
  }

  return (
    <form className="car-form" onSubmit={handleSubmit(handleFormSubmit)}>
      

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input
            id="brand"
            type="text"
            placeholder="e.g. Toyota"
            {...register("brand", {
              required: "Brand is required",
              minLength: {
                value: 2,
                message: "Brand must have at least 2 characters"
              }
            })}
          />
          {errors.brand && (
            <p className="form-error">{errors.brand.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            id="model"
            type="text"
            placeholder="e.g. Corolla"
            {...register("model", {
              required: "Model is required"
            })}
          />
          {errors.model && (
            <p className="form-error">{errors.model.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="doorsNumber">Doors Number *</label>
          <input
            id="doorsNumber"
            type="number"
            {...register("doorsNumber", {
              valueAsNumber: true,
              required: "Please enter the number of doors",
              min: {
                value: 2,
                message: "Minimum 2 doors"
              },
              max: {
                value: 5,
                message: "Maximum 5 doors"
              }
            })}
          />
          {errors.doorsNumber && (
            <p className="form-error">{errors.doorsNumber.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="luggageCapacity">Luggage Capacity (L) *</label>
          <input
            id="luggageCapacity"
            type="number"
            {...register("luggageCapacity", {
              valueAsNumber: true,
              required: "Please enter luggage capacity",
              min: {
                value: 0,
                message: "Value cannot be negative"
              }
            })}
          />
          {errors.luggageCapacity && (
            <p className="form-error">{errors.luggageCapacity.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="engineCapacity">Engine Capacity (cm³) *</label>
          <input
            id="engineCapacity"
            type="number"
            {...register("engineCapacity", {
              valueAsNumber: true,
              required: "Please enter engine capacity",
              min: {
                value: 1,
                message: "Value must be positive"
              }
            })}
          />
          {errors.engineCapacity && (
            <p className="form-error">{errors.engineCapacity.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type *</label>
          <select
            id="fuelType"
            {...register("fuelType", {
              valueAsNumber: true
            })}
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
            type="date"
            {...register("productionDate", {
              required: "Please enter production date"
            })}
          />
          {errors.productionDate && (
            <p className="form-error">{errors.productionDate.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="averageFuelConsumption">
            Avg. Fuel Consumption (L/100km) *
          </label>
          <input
            id="averageFuelConsumption"
            type="number"
            step="0.1"
            {...register("averageFuelConsumption", {
              valueAsNumber: true,
              required: "Please enter average fuel consumption",
              min: {
                value: 0.1,
                message: "Value must be positive"
              }
            })}
          />
          {errors.averageFuelConsumption && (
            <p className="form-error">{errors.averageFuelConsumption.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bodyType">Body Type *</label>
          <select
            id="bodyType"
            {...register("bodyType", {
              valueAsNumber: true
            })}
          >
            {Object.entries(BodyTypeLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-group-full">
          <label>Equipment</label>
          {featuresPending ? (
            <p className="loading-text">Loading equipment...</p>
          ) : (
            <div className="features-grid">
              {features.map((feature) => {
               return (
                <label className="feature-checkbox" key={feature.id}>
                  <input
                    type="checkbox"
                    value={feature.id}
                    // checked={initialValues?.featureIds?.some((v) => v == feature.id) ?? false }
                    {...register("featureIds")}
                  />
                
                  <span>{feature.name}</span>
                </label>
              )})}
            </div>
          )}
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
