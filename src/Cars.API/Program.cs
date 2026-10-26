using Cars.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Cars.Application.Cars;
using Cars.Application.Common.Behaviors;
using FluentValidation;
using MediatR;
using Cars.API.Middleware;

// Entry point using .NET's Minimal Hosting model and top-level statements.
// WebApplication.CreateBuilder initializes configuration (appsettings.json, environment variables) and the DI container.
var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURE SERVICES (Dependency Injection)
// Equivalent to Spring's @Configuration and @Bean definitions
// ==========================================

// Registers OpenAPI document generation services (for API documentation and Swagger).
builder.Services.AddOpenApi();

// Registers DataContext into the DI container with a SCOPED lifetime:
// - Scoped means a single instance is created per HTTP request and disposed when the request ends.
// - DbContext MUST be Scoped because it is not thread-safe and caches tracked entities in memory.
// - Reads the connection string ("Data Source=cars.db") from appsettings.json.
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Configures CORS (Cross-Origin Resource Sharing):
// Browsers block web applications on one domain/port from making AJAX calls to another port.
// This policy allows our frontend (e.g., at http://localhost:5085) to access the API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:5085");
    });
});

// Scans the solution for classes that inherit from ControllerBase or have [ApiController],
// registers them with the DI container, and sets up MVC action discovery, model binding, and formatters.
builder.Services.AddControllers();

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(GetCarsList.Handler).Assembly);
});

builder.Services.AddValidatorsFromAssemblyContaining<Create.CommandValidator>();

builder.Services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>));

// ==========================================
// 2. BUILD THE APPLICATION
// ==========================================
// Freezes the service collection and builds the WebApplication host.
var app = builder.Build();

app.UseMiddleware<ApiExceptionMiddleware>();
// ==========================================
// 3. CONFIGURE THE HTTP REQUEST PIPELINE (Middleware)
// Middleware executes sequentially on every incoming HTTP request and outgoing response
// (Conceptually identical to Spring's Servlet Filter Chain). Order matters!
// ==========================================

// Configure Swagger UI only in Development mode to avoid exposing API specs in Production:
if (app.Environment.IsDevelopment())
{
    // Serves the generated OpenAPI document at /openapi/v1.json:
    app.MapOpenApi();

    // Serves the interactive Swagger UI interface:
    // To open Swagger, visit: http://localhost:5085/swagger/
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "Cars API v1"
        );
    });
}

// Automatically redirects plain HTTP requests to HTTPS:
app.UseHttpsRedirection();

// Applies CORS headers to outgoing responses.
// MUST be placed before UseAuthorization and MapControllers so pre-flight OPTIONS requests succeed!
app.UseCors("CorsPolicy");

// Checks if the user/request satisfies any [Authorize] attributes on the target endpoint:
app.UseAuthorization();

// Connects incoming HTTP request URLs to the corresponding Controller actions
// using the Endpoint Routing Table generated from [Route] and [HttpGet] attributes:
app.MapControllers();


// ==========================================
// 4. DATABASE MIGRATION & SEEDING AT STARTUP
// ==========================================

// Why "using var scope = app.Services.CreateScope()"?
// 1. DataContext is registered as a SCOPED service (created per HTTP request).
// 2. At startup, there is NO HTTP request! Trying to resolve DataContext directly
//    from the root provider (app.Services) throws an InvalidOperationException.
// 3. 'CreateScope()' manually creates a temporary scope to resolve scoped services safely.
// 4. 'using var scope': C# 8+ using declaration (equivalent to Java's try-with-resources).
//    When startup completes, scope.Dispose() is called automatically, which disposes
//    the DataContext and safely closes the database connection.
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    // Resolve our scoped DataContext from the temporary scope:
    var context = services.GetRequiredService<DataContext>();

    // MigrateAsync checks the internal '__EFMigrationsHistory' table in SQLite:
    // - If the database does not exist, it creates it.
    // - If there are new migrations compiled in code that are not yet in the DB, it applies only those.
    // - If all migrations were already applied previously, it does nothing (safe to run on every startup).
    await context.Database.MigrateAsync();

    // Runs our custom seeder to insert initial cars if the database is currently empty:
    await Seed.SeedData(context);
}
catch (Exception e)
{
    // If migration fails (e.g. database file locked or invalid connection string),
    // log the error via ASP.NET Core's built-in logging framework:
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(e, "An error occurred during migration.");
}

// Starts the Kestrel web server and begins listening for incoming HTTP requests:
app.Run();

