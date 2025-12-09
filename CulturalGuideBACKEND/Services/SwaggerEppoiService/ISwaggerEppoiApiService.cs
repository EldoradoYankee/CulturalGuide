using System.Collections.Generic;
using System.Threading.Tasks;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;
using CulturalGuideBACKEND.Models;

namespace CulturalGuideBACKEND.Services.SwaggerEppoiService
{
    public interface ISwaggerEppoiApiService
    {
        Task<object> GetPointsOfInterestAsync(string city);
        Task<object> GetPoiDetailsAsync(string id);
        Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request);
        Task<IEnumerable<EppoiCategoriesDTO>> GetCategoriesAsync(string municipality, string language);
    }
}
