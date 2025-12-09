using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;
using CulturalGuideBACKEND.Models;
using System.Threading.Tasks;

namespace CulturalGuideBACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Frontend must be authenticated to access this
    public class EppoiApiController : ControllerBase
    {
        private readonly ISwaggerEppoiApiService _swaggerEppoiService;
        private readonly string _swaggerEppoiBaseUrl;
        private readonly string _swaggerEppoiApiKey;

        public EppoiApiController(ISwaggerEppoiApiService swaggerEppoiService, IConfiguration config)
        {
            _swaggerEppoiService = swaggerEppoiService;
            _swaggerEppoiBaseUrl = config["SwaggerEppoiApi:BaseUrl"]!;
            _swaggerEppoiApiKey = config["SwaggerEppoiApi:ApiKey"]!;
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
        //  EXAMPLE ENDPOINT #2
        //  Fetch details for a single POI
        // ===============================
        [HttpGet("poi/{id}")]
        public async Task<IActionResult> GetPoiDetails([FromRoute] string id)
        {
            var result = await _swaggerEppoiService.GetPoiDetailsAsync(id);
            return Ok(result);
        }
        
        // ===============================
        //  EXAMPLE ENDPOINT #4
        //  Fetch categories for a municipality
        //  Maps to:
        //  https://apispm.eppoi.io/api/categories?municipality=Massignano&language=it
        // ===============================
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories(
            [FromQuery] string municipality,
            [FromQuery] string language = "it")
        {
            var categories = await _swaggerEppoiService.GetCategoriesAsync(municipality, language);
            return Ok(categories);
        }


        // ===============================
        //  EXAMPLE ENDPOINT #3
        //  Search for experiences based on interests
        // ===============================
        [HttpPost("search")]
        public async Task<IActionResult> SearchExperiences([FromBody] SwaggerEppoiRequest request)
        {
            var result = await _swaggerEppoiService.SearchExperiencesAsync(request);
            return Ok(result);
        }
    }
}
