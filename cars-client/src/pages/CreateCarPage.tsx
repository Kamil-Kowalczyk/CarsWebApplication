import { useNavigate } from 'react-router';
import type { NewCar } from '../models/Car';
import { FuelType, BodyType } from '../models/Car';
import { createCar } from '../services/carService';
import CarForm from '../components/CarForm';

export const CreateCarPage = () => {
  const navigate = useNavigate();

  const initialValues: NewCar = {
    brand: '',
    model: '',
    doorsNumber: 5,
    luggageCapacity: 450,
    engineCapacity: 1600,
    fuelType: FuelType.Petrol,
    productionDate: new Date().toISOString().split('T')[0],
    averageFuelConsumption: 6.0,
    bodyType: BodyType.Sedan
  };

  const handleCreate = async (carData: NewCar) => {
    const createdCar = await createCar(carData);
    navigate(`/cars/${createdCar.id}`);
  };

  return (
    <div className="page-container">
      <div className="card form-card">
        <h2>Add New Car</h2>
        <p className="card-subtitle">
          Fill in the details below to add a new car to the fleet.
        </p>
        <CarForm
          initialValues={initialValues}
          onSubmit={handleCreate}
          submitButtonText="Create Car"
          onCancel={() => navigate('/cars')}
        />
      </div>
    </div>
  );
};

export default CreateCarPage;