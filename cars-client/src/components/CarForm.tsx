import { useState } from 'react';
import type { CarFormValues } from '../models/CarFormValues';
import { FuelType, BodyType, FuelTypeLabels, BodyTypeLabels } from '../models/Car';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormState, useForm } from 'react-hook-form';
import { getFeatures } from '../services/carService';
import { queryKeys } from '../queries/queryKey';

interface CarFormProps {
  initialValues?: Partial<CarFormValues>;
  onSubmit: (car: CarFormValues) => Promise<void>;
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
  const queryClient = useQueryClient();
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
      featureIds: initialValues?.featureIds ?? []
    },
  });


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

                message: "Brand has to have at least 2 characters"
              }
            })}
          />
          {errors.brand && (
            <p>{errors.brand.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            id="model"
            name="model"
            type="text"
            required
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type *</label>
          <select
            id="fuelType"
            name="fuelType"
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="bodyType">Body Type *</label>
          <select
            id="bodyType"
            name="bodyType"
          >
            {Object.entries(BodyTypeLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bodyType">Equipment *</label>
            {featuresPending ? (
                <p>Loading Equipment...</p>
              ) : (
                <div className="">
                  {features.map((feature) => (
                    <div className="" key={feature.id}>
                      <label className="">
                        <input
                          className=""
                          type="checkbox"
                          value={feature.id}
                          {...register("featureIds")}
                        />
                        <span className="">{feature.name}</span>
                      </label>
                    </div>
                  ))}
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
