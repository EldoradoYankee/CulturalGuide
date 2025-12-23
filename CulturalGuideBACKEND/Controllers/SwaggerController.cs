using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;
using CulturalGuideBACKEND.Models;
using System.Threading.Tasks;

namespace CulturalGuideBACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class EppoiApiController : ControllerBase
    {
        private readonly ISwaggerEppoiApiService _swaggerEppoiService;
        private readonly string _swaggerEppoiBaseUrl;
        private readonly string _swaggerEppoiApiKey;
        private readonly ILogger<EppoiApiController> _logger;

        public EppoiApiController(
            ISwaggerEppoiApiService swaggerEppoiService, IConfiguration config, ILogger<EppoiApiController> logger)
        {
            _swaggerEppoiService = swaggerEppoiService;
            _swaggerEppoiBaseUrl = config["SwaggerEppoiApi:BaseUrl"]!;
            _swaggerEppoiApiKey = config["SwaggerEppoiApi:ApiKey"]!;
            _logger = logger;
        }

        // --------------------------------------------------------------------
        //  GENERAL INFORMATION
        // --------------------------------------------------------------------
        // This controller acts as the BACKEND interface for the external API:
        //
        //   https://apispm.eppoi.io/swagger/index.html
        //
        // All calls to the external API go through a dedicated service:
        //   IEppoiApiService
        //
        // Authentication to Eppoi is also handled inside that service.
        //
        // In the future, this controller will transform the API responses
        // into Frontend DTOs for optimal presentation.
        // --------------------------------------------------------------------


        // ===============================
        //  EXAMPLE ENDPOINT #1
        //  Fetch POIs in a city
        // ===============================
        [HttpGet("pois")]
        public async Task<IActionResult> GetPointsOfInterest([FromQuery] string city)
        {
            // Call service (implementation later)
            var result = await _swaggerEppoiService.GetPointsOfInterestAsync(city);

            return Ok(result);
        }
        
        // ===============================
        //  Proxy Image Endpoint for POI images
        // ===============================
        [HttpGet("proxy-image")]
        public async Task<IActionResult> ProxyImage([FromQuery] string imageUrl)
        {
	        if (string.IsNullOrEmpty(imageUrl))
	        { return BadRequest("Image URL is required"); }

	        try
	        {
		        using var httpClient = new HttpClient();
		        var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);
        
		        // Detect content type from URL extension
		        var contentType = imageUrl.EndsWith(".webp") ? "image/webp" 
			        : imageUrl.EndsWith(".jpg") || imageUrl.EndsWith(".jpeg") ? "image/jpeg"
			        : imageUrl.EndsWith(".png") ? "image/png"
			        : "image/jpeg";
        
		        return File(imageBytes, contentType);
	        }
	        catch (Exception ex)
	        {
		        _logger.LogError(ex, "Failed to proxy image: {ImageUrl}", imageUrl);
		        return NotFound();
	        }
        }


        // ===============================
        //  EXAMPLE ENDPOINT #2
        //  Fetch details for a EatAndDrink POI by municipality
        // ===============================
		
		/// <summary>
		/// Retrieves the Eat And Drink (POIs) for a given city.
		/// </summary>
		/// <param name="city">Name of the municipality</param>
		/// <returns>List of POIs</returns>
		[HttpGet("eat-and-drinks")]
        public async Task<IActionResult> GetEatAndDrinks(
            [FromQuery] string municipality,
            [FromQuery] string language)
        {
            var result = await _swaggerEppoiService.GetEatAndDrinksAsync(municipality, language);
            return Ok(result);
        }

        // ===============================
        //  EXAMPLE ENDPOINT #3
        //  Search for experiences based on interests
        // ===============================
		/// <summary>
		/// Returns all available categories available for a specific municipality from the external Eppoi API.
		/// </summary>
		/// <remarks>
		/// Maps to: https://apispm.eppoi.io/api/categories
		/// </remarks>
		/// <response code="200">List of municipalities</response>
		/// <response code="500">Server error fetching municipalities</response>
        [HttpPost("search")]
        public async Task<IActionResult> SearchExperiences([FromBody] SwaggerEppoiRequest request)
        {
            var result = await _swaggerEppoiService.SearchExperiencesAsync(request);
            return Ok(result);
        }
        
        // ===============================
        //  EXAMPLE ENDPOINT #4
        //  Fetch categories for a municipality
        //  Maps to:
        //  https://apispm.eppoi.io/api/categories?municipality=Massignano&language=it
        // ===============================
		
		/// <summary>
		/// Returns all available categories available for a specific municipality from the external Eppoi API.
		/// </summary>
		/// <remarks>
		/// Maps to: https://apispm.eppoi.io/api/categories
		/// </remarks>
		/// <response code="200">List of municipalities</response>
		/// <response code="500">Server error fetching municipalities</response>
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories(
            [FromQuery] string municipality,
            [FromQuery] string language = "it")
        {
            var categories = await _swaggerEppoiService.GetCategoriesAsync(municipality, language);
            return Ok(categories);
        }
        
        // ===============================
        //  EXAMPLE ENDPOINT #5
        //  municipalities
        //  Maps to: https://apispm.eppoi.io/api/municipalities
        // ===============================
		/// <summary>
		/// Returns all available municipalities from the external Eppoi API.
		/// </summary>
		/// <remarks>
		/// Maps to: https://apispm.eppoi.io/api/organizations/municipalities
		/// </remarks>
		/// <response code="200">List of municipalities</response>
		/// <response code="500">Server error fetching municipalities</response>
        [HttpGet("municipalities")]
        public async Task<IActionResult> GetMunicipalities()
        {
            // print log
            _logger.LogInformation("Fetching municipalities from EppoiApiController...");
            var municipalities = await _swaggerEppoiService.GetMunicipalitiesAsync();
            return Ok(municipalities);
        }
    }
}
