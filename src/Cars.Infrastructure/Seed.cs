using Cars.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cars.Infrastructure;

// Static class because this is a stateless utility/helper executed only at application startup.
// It doesn't need to maintain its own state or be registered in the DI container.
public static class Seed
{
    public static async Task SeedData(DataContext context)
    {
        // Idempotency check:
        // AnyAsync() runs a fast SQL query (SELECT 1 FROM Cars LIMIT 1).
        // If the database already contains at least one car, exit immediately.
        // This ensures data is permanently saved to the database on the first run,
        // and does NOT insert duplicate records every time the server restarts.
        if (await context.Cars.AnyAsync()) return;

        // Create sample in-memory domain entities to populate the initial database:
        var cars = new List<Car>
        {
            new Car
            {
                Brand = "Mazda",
                Model = "CX-60",
                DoorsNumber = 5,
                LuggageCapacity = 570,
                EngineCapacity = 2488,
                FuelType = FuelType.Hybrid,
                ProductionDate = DateTime.UtcNow.AddMonths(-6),
                AverageFuelConsumption = 1.5,
                BodyType = BodyType.SUV
            },
            new Car
            {
                Brand = "Renault",
                Model = "Clio",
                DoorsNumber = 5,
                LuggageCapacity = 391,
                EngineCapacity = 999,
                FuelType = FuelType.Petrol,
                ProductionDate = DateTime.UtcNow.AddYears(-4),
                AverageFuelConsumption = 5.8,
                BodyType = BodyType.Hatchback
            },
            new Car
            {
                Brand = "Toyota",
                Model = "Corolla",
                DoorsNumber = 4,
                LuggageCapacity = 471,
                EngineCapacity = 1798,
                FuelType = FuelType.Hybrid,
                ProductionDate = DateTime.UtcNow.AddYears(-2),
                AverageFuelConsumption = 4.7,
                BodyType = BodyType.Sedan
            }
        };

        // 1. Change Tracker:
        // AddRangeAsync tells EF Core's Change Tracker to start monitoring these instances
        // and assign their state to 'EntityState.Added'.
        // (NOTE: No SQL is sent to the database at this point).
        await context.Cars.AddRangeAsync(cars);

        // 2. Commit to Database:
        // SaveChangesAsync inspects the Change Tracker, sees the 'Added' entities,
        // generates the corresponding SQL 'INSERT INTO Cars (...) VALUES (...)' queries,
        // executes them inside a transaction, and writes them permanently to the SQLite database.
        await context.SaveChangesAsync();
    }
}