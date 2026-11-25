import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { Car, NewCar } from '../models/Car';
import { getCarById, updateCar } from '../services/carService';
import CarForm from '../components/CarForm';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries/queryKey';
import type { CarFormValues } from '../models/CarFormValues';

export const EditCarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const carId = id ?? ""


  const {
    data: car,
    isPending: isCarPending,
    isError: isCarError,
    error: carError,
  } = useQuery({
    // Każdy samochód ma osobny wpis w cache:
    //
    // ['car', 'guid-samochodu']
    queryKey: queryKeys.car(carId),
    // TanStack Query przekazuje AbortSignal.
    // Nie musimy tworzyć własnego AbortController.
    queryFn: ({ signal }) => getCarById(carId, signal),
    // Jeśli id nie istnieje,
    // zapytanie nie powinno zostać uruchomione.
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    // mutationFn mówi:
    //
    // "jak wykonać operację zmieniającą dane".
    mutationFn: (values: CarFormValues) => updateCar(carId, values),
    // Ta funkcja wykona się,
    // jeśli PUT zakończy się sukcesem.
    onSuccess: async () => {
    // Lista samochodów może zawierać
    // stare dane.
      await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.cars }),
      queryClient.invalidateQueries({ queryKey: queryKeys.car(carId) }),
    ]);
      // Po zapisaniu wracamy
      // do szczegółów samochodu.
      navigate(`/cars/${carId}`);
    },
  });
  // =========================================================
  // SUBMIT FORMULARZA
  // =========================================================
  function onSubmit(values: CarFormValues) {
    // Nie robimy już ręcznie:
    //
    // event.preventDefault()
    // try/catch
    // setIsSubmitting(...)
    //
    // handleSubmit i useMutation
    // przejmują te obowiązki.
    updateMutation.mutate(values);
  }

  if (isCarPending) {
    return (
      <div className="page-container">
        <p className="loading-text">Loading car data for editing...</p>
      </div>
    );
  }

  if (isCarError || !car) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <h3>Error</h3>
          <p>{carError.message || 'Car not found.'}</p>
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
          initialValues={{
            ...car
            
          }}
          onSubmit={onSubmit}
          submitButtonText="Save Changes"
          isSubmitting={updateMutation.isPending}
          onCancel={() => navigate(`/cars/${car.id}`)}
        />
      </div>
    </div>
  );
};

export default EditCarPage;