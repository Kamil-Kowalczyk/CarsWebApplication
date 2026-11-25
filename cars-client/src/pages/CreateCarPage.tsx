import { useNavigate } from 'react-router';
import type { CarFormValues } from '../models/CarFormValues';
import { FuelType, BodyType } from '../models/Car';
import { createCar, getFeatures } from '../services/carService';
import CarForm from '../components/CarForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queries/queryKey';

export const CreateCarPage = () => {
  const navigate = useNavigate();

  const initialValues: CarFormValues = {
    brand: '',
    model: '',
    doorsNumber: 5,
    luggageCapacity: 450,
    engineCapacity: 1600,
    fuelType: FuelType.Petrol,
    productionDate: new Date().toISOString().split('T')[0],
    averageFuelConsumption: 6.0,
    bodyType: BodyType.Sedan,
    featureIds: []
  };
   const queryClient = useQueryClient();
  

  // =========================================================
  // TANSTACK QUERY -- CREATE
  // =========================================================
  const createMutation = useMutation({
    mutationFn: createCar,
    onSuccess: (createdCar) => {
      // Lista aut w cache jest już nieaktualna.
      queryClient.invalidateQueries({
        queryKey: queryKeys.cars,
      });

      // Przechodzimy do szczegółów
      // nowo utworzonego samochodu.
      navigate(`/cars/${createdCar.id}`);
    },
  });



  const handleCreate = async (carData: CarFormValues) => {
    createMutation.mutate(carData)
  };

  return (
    <div className="page-container">
      <div className="card form-card">
        <h2>Add New Car</h2>
        <p className="card-subtitle">
          Fill in the details below to add a new car to the fleet.
        </p>
        {createMutation.isError && <div className="alert alert-error">{createMutation.error.message}</div>}
        <CarForm
          initialValues={initialValues}
          onSubmit={handleCreate}
          submitButtonText="Create Car"
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/cars')}
        />
      </div>
    </div>
  );
};

export default CreateCarPage;