// using Cars.Domain;
// using Cars.Infrastructure;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace Cars.API.Controllers;

// // Inherits from BaseApiController:
// // - Automatically receives the [ApiController] attribute and route: "api/cars"
// public class CarsController : BaseApiController
// {
//     private readonly DataContext _context;

//     // Constructor Dependency Injection (DI):
//     // Like Spring's @Autowired constructor injection, ASP.NET Core checks builder.Services,
//     // sees DataContext registered, and automatically passes an instance when instantiating this controller.
//     // 'readonly' ensures this dependency cannot be accidentally modified or overwritten after initialization.
//     public CarsController(DataContext context)
//     {
//         _context = context;
//     }

//     // GET /api/cars
//     // ActionResult<T> allows returning either an HTTP status result (like NotFound(), BadRequest())
//     // or the raw object (List<Car>), which ASP.NET Core automatically serializes to JSON with HTTP 200 OK.
//     [HttpGet]
//     public async Task<ActionResult<List<Car>>> GetCars()
//     {
//         // .AsNoTracking():
//         // PERFORMANCE OPTIMIZATION for read-only queries.
//         // By default, EF Core tracks changes to loaded entities so it knows what to update if you edit them.
//         // Because we are only reading data here, disabling tracking saves memory and CPU cycles.
//         // (Rule of Thumb: Use AsNoTracking() for GET, but OMIT it when you plan to update/delete an entity).
//         //
//         // .ToListAsync(): Asynchronously executes the query in SQLite, freeing up the thread while waiting for I/O.
//         return await _context.Cars.AsNoTracking().ToListAsync();
//     }

//     // GET /api/cars/{id}
//     // Route constraint "{id:guid}":
//     // Ensures this route only matches if the URL parameter is a valid GUID (e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6).
//     // If someone calls "/api/cars/abc", routing fails safely instead of throwing a parsing exception.
//     [HttpGet("{id:guid}")]
//     public async Task<ActionResult<Car>> GetCar(Guid id)
//     {
//         // LINQ & Expression Trees (Difference from Java Stream API):
//         // In Java, stream().filter() runs in application memory.
//         // Here, EF Core translates the lambda expression (x => x.Id == id) into SQL:
//         //    SELECT * FROM Cars WHERE Id = @id LIMIT 1;
//         // The filtering happens directly on the database engine; only 1 row is sent across the network!
//         var car = await _context.Cars.AsNoTracking()
//             .FirstOrDefaultAsync(x => x.Id == id);

//         // If no car with this Id exists in the database, return HTTP 404 Not Found:
//         if (car is null) return NotFound();

//         // Returning the entity directly wraps it in an HTTP 200 OK with the car serialized as JSON:
//         return car;
//     }

//     [HttpPost]
//     public async Task<ActionResult<Car>> CreateCar(Car car)
//     {
//         _context.Set<Car>().Add(car);
//         await _context.SaveChangesAsync();

//         return CreatedAtAction(nameof(GetCar), new {id = car.Id}, car);
//     }

//     [HttpPut("{id:guid}")]
//     public async Task<ActionResult> UpdateCar(Guid id, Car car)
//     {
//         Car carFromRepo = await _context.FindAsync<Car>(id);

//         if (carFromRepo == null) 
//             return NotFound();

        
//         carFromRepo.Brand = car.Brand;
//         carFromRepo.Model = car.Model;
//         carFromRepo.DoorsNumber = car.DoorsNumber;
//         carFromRepo.LuggageCapacity = car.LuggageCapacity;
//         carFromRepo.EngineCapacity = car.EngineCapacity;
//         carFromRepo.FuelType = car.FuelType;
//         carFromRepo.ProductionDate = car.ProductionDate;
//         carFromRepo.AverageFuelConsumption = car.AverageFuelConsumption;
//         carFromRepo.BodyType = car.BodyType;

//         await _context.SaveChangesAsync();

//         return NoContent();
//     }

//     [HttpDelete("{id:guid}")]
//     public async Task<ActionResult> DeleteCar(Guid id)
//     {
//         Car car = await _context.Set<Car>().FindAsync(id);

//         if (car == null) 
//             return NotFound();

//         _context.Set<Car>().Remove(car);
//         await _context.SaveChangesAsync();
//         return NoContent();
//     }
// }

using Cars.Application.Cars;
using Cars.Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Cars.API.Controllers;

public class CarsController : BaseApiController
{
    private readonly ISender _sender;

    public CarsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<List<Car>>> GetCars()
    {
        return await _sender.Send(new GetCarsList.Query());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Car>> GetCar(Guid id)
    {
        var car = await _sender.Send(new Details.Query { Id = id });

        if (car is null)
        {
            return NotFound();
        }

        return car;
    }

    [HttpPost]
    public async Task<ActionResult<Car>> CreateCar(Car car)
    {
        var result = await _sender.Send(new Create.Command { Car = car });

        return CreatedAtAction(
            nameof(GetCar),
            new { id = result.Id },
            result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCar(Guid id, Car car)
    {
        var result = await _sender.Send(new Edit.Command
        {
            Id = id,
            Car = car
        });

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCar(Guid id)
    {
        var result = await _sender.Send(new Delete.Command { Id = id });

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}