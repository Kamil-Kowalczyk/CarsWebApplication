using System.Text;
using Cars.API.Middleware;
using Cars.API.Services;
using Cars.Application.Cars;
using Cars.Application.Common.Behaviors;
using Cars.Domain;
using Cars.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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


builder.Services
    .AddIdentityCore<AppUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = true;

        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<DataContext>()
    .AddDefaultTokenProviders();


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Brak Jwt:Key.");

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)),

                ClockSkew = TimeSpan.FromSeconds(30),
            };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, TokenService>();


builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("Smtp"));

builder.Services.AddScoped<IEmailService, EmailService>();

// Configures CORS (Cross-Origin Resource Sharing):
// Browsers block web applications on one domain/port from making AJAX calls to another port.
// This policy allows our frontend (e.g., at http://localhost:5085) to access the API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithOrigins("http://localhost:5173");
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

// ==========================================
// 3. CONFIGURE THE HTTP REQUEST PIPELINE (Middleware)
// Middleware executes sequentially on every incoming HTTP request and outgoing response
// (Conceptually identical to Spring's Servlet Filter Chain). Order matters!
// ==========================================

app.UseMiddleware<ApiExceptionMiddleware>();

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

// 1. CORS - applies headers to responses (before redirection/auth):
app.UseCors("CorsPolicy");

// 2. Automatically redirects plain HTTP requests to HTTPS:
app.UseHttpsRedirection();

// 3. Authentication - identifies WHO the user is (validates the JWT Bearer token):
app.UseAuthentication();

// 4. Authorization - checks if the identified user has PERMISSION for the endpoint ([Authorize]):
app.UseAuthorization();

// 5. Connects incoming HTTP request URLs to the corresponding Controller actions:
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

    
    var userManager = services.GetRequiredService<
        UserManager<AppUser>>();

    var roleManager = services.GetRequiredService<
        RoleManager<IdentityRole>>();

    await IdentitySeed.SeedAsync(
        userManager,
        roleManager);
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

