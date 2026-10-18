using Microsoft.AspNetCore.Mvc;

namespace Cars.API.Controllers;

// [ApiController] is a C# Attribute (the C# equivalent of a Java Annotation like @RestController).
// It enables opinionated Web API features:
// 1. Automatic 400 Bad Request responses when model validation fails (e.g., [Required] fields missing).
// 2. Automatic parameter source inference (infers whether parameters come from Route, Body, or Query string).
// 3. Formats error responses using the standardized RFC 7807 ProblemDetails specification.
[ApiController]

// [Route("api/[controller]")] defines the base URL routing template.
// The "[controller]" token is automatically replaced with the derived class name minus the "Controller" suffix.
// For example: CarsController -> route becomes "api/cars".
[Route("api/[controller]")]

// Inheriting from ControllerBase:
// ControllerBase provides core Web API helpers (Ok(), NotFound(), BadRequest(), CreatedAtAction()).
// Note: We inherit from ControllerBase, NOT 'Controller'. 'Controller' adds support for Razor HTML views,
// which is unnecessary overhead for a purely JSON/REST API.
//
// By creating this BaseApiController, all derived controllers inherit these attributes and routes (DRY principle).
public class BaseApiController : ControllerBase
{
    
}