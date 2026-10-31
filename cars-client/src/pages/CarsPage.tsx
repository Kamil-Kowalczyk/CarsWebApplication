import { useEffect, useState } from 'react';
import type { Car } from '../models/Car';
import { FuelTypeLabels, BodyTypeLabels } from '../models/Car';
import { getCars, deleteCar } from '../services/carService';
import { useNavigate } from 'react-router';
import CarItem from '../components/CarItem';
import SearchBar from '../components/SearchBar';

export const CarsPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCars = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const fetchedCars = await getCars(abortController.signal);
        setCars(fetchedCars);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
            return
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error!');
        }
      } finally {
        if (!abortController.signal.aborted) {
            setIsLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
        abortController.abort()
    }
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this car?'
    );

    if (confirmed) {
      try {
        await deleteCar(id);
        setCars((prev) => prev.filter((car) => car.id !== id));
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(`Failed to delete car: ${err.message}`);
        } else {
          alert('Failed to delete car.');
        }
      }
    }
  };

  const handleDetails = (id: string) => {
    navigate('/cars/' + id);
  };

  const handleEdit = (id: string) => {
    navigate('/cars/' + id + '/edit');
  };

  const filteredCars = cars.filter((car: Car) => {
    if (car.model.toLowerCase().includes(filter.toLocaleLowerCase()) ||
        car.brand.toLowerCase().includes(filter.toLocaleLowerCase()))
        return true
    return false
  })

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cars Fleet</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/cars/new')}
        >
          + Add New Car
        </button>
      </div>
      <SearchBar 
        searchedText={filter}
        handleChange={(e) => setFilter(e.target.value)}
        handleClick={() => setFilter('')}
      />
      
      

      {isLoading && (
        <div className="loading-container">
          <p className="loading-text">Loading cars...</p>
        </div>
      )}

      {!isLoading && error.length !== 0 && (
        <div className="alert alert-error">
          <h3>Server has run into some problems</h3>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && error.length === 0 && cars.length === 0 && (
        <div className="empty-state">
          <p>Oops, there are no cars...</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/cars/new')}
          >
            Add the first car
          </button>
        </div>
      )}
    
      {!isLoading && error.length === 0 && filteredCars.length === 0 && cars.length > 0 && (
        <div className="empty-state">
            <p>No cars match &quot;{filter}&quot;.</p>
          </div>
      )}

      {!isLoading && error.length === 0 && filteredCars.length > 0 && (
        <div className="car-list">
          {filteredCars.map((car: Car) => (
            <CarItem 
              car={car} 
              handleDelete={handleDelete}
              handleDetails={handleDetails}
              handleEdit={handleEdit}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarsPage;