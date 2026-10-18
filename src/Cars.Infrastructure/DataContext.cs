using System.Dynamic;
using Cars.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cars.Infrastructure;

// DbContext is the primary class in Entity Framework Core that coordinates database functionality.
// It acts as the bridge between your C# domain models and the underlying database:
// - Manages the database connection lifecycle
// - Translates LINQ queries into raw SQL
// - Tracks changes to entities (Add, Update, Delete) via its ChangeTracker
public class DataContext : DbContext
{
    // Constructor Dependency Injection:
    // In Program.cs, builder.Services.AddDbContext<DataContext>(...) registers DataContext in the DI container.
    // The DI container passes configured database options (e.g. SQLite connection string) via DbContextOptions<DataContext>.
    // ': base(options)' passes those settings up to EF Core's base DbContext class.
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    // DbSet<Car> represents the "Cars" table in the database and acts as an in-memory collection of Car entities.
    // NOTE: This is a C# PROPERTY (has get/set accessors), NOT a simple field.
    // Equivalent modern expression-bodied syntax:
    //    public DbSet<Car> Cars => Set<Car>();
    // (Using '=> Set<Car>()' avoids nullable warnings in C# without needing null-forgiveness '= null!;')
    public DbSet<Car> Cars {get; set;}
}