using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Data;

namespace CulturalGuideBACKEND.Services.SwaggerEppoiService
{
    public class SwaggerEppoiApiService : ISwaggerEppoiApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<SwaggerEppoiApiService> _logger;
		private readonly AppDbContext _db;

        public SwaggerEppoiApiService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<SwaggerEppoiApiService> logger, AppDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            _config = config;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Base URL for the API
            _httpClient.BaseAddress = new Uri(_config["SwaggerEppoiApi:BaseUrl"]);
			_db = db;
        }

        // =====================
        // AUTHENTICATION
        // =====================
        private async Task EnsureAuthenticatedAsync()
        {
            // TODO: implement token retrieval and caching
            string token = "FAKE_TOKEN"; // placeholder
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        // =====================
        // POINTS OF INTEREST
        // =====================
        public async Task<object> GetPointsOfInterestAsync(string city)
        {
            await EnsureAuthenticatedAsync();
            // TODO: implement actual API call
            return new { message = "POI endpoint skeleton", city };
        }

		// =====================
        // EATANDDRINK BY MUNICIPALITY
        // =====================
        public async Task<IEnumerable<EppoiEatAndDrinksDTO>> GetEatAndDrinksAsync(string municipality, string language)
        {
            await EnsureAuthenticatedAsync();

			var url = $"/api/eat-and-drink/card-list?municipality={municipality}&language={language}";

			_logger.LogInformation($"Eppoi GetEatAndDrinksAsync Base URL: {url}");
            var response = await _httpClient.GetAsync(url);

            response.EnsureSuccessStatusCode();

			// Deserialize JSON response into DTOs
            var result = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiEatAndDrinksDTO>>();

			_logger.LogInformation($"Eppoi GetEatAndDrinksAsync response: {result.Count()} items received for municipality: {municipality}");

			// save to db if not already present
			//foreach (var m in result)
            //{
            //    bool exists = _db.EatAndDrink.Any(x => x.EntityName == m.EntityName);

            //    if (!exists)
            //    {
            //        _db.EatAndDrink.Add(new EatAndDrink
            //        {
            //            EntityName = m.EntityName,
            //            ImagePath = m.ImagePath,
			//			BadgeText = m.BadgeText,
			//			Address = m.Address
            //        });
            //        await _db.SaveChangesAsync();	
            //    }
            //}

            return result ?? Array.Empty<EppoiEatAndDrinksDTO>();
        }

		// =====================
        // SEARCH EXPERIENCES
        // =====================
        public async Task<object> SearchExperiencesAsync(SwaggerEppoiRequest request)
        {
            await EnsureAuthenticatedAsync();
            return new { message = "Search skeleton", request };
        }

        // =====================
        // CATEGORIES BY MUNICIPALITY
        // =====================
        public async Task<IEnumerable<EppoiCategoriesDTO>> GetCategoriesAsync(string municipality, string language)
        {
            //await EnsureAuthenticatedAsync();

            var url = $"/api/categories?municipality={municipality}&language={language}";
			_logger.LogInformation($"Eppoi Base URL: {url}");

            var response = await _httpClient.GetAsync(url);

			// Log response status from Eppoi API Controller
			_logger.LogInformation($"Eppoi GetCategoriesAsync response status from Controller: {response}");
			
			// -------------------------
			// PRINT ALL CATEGORIES
    		// -------------------------
    		_logger.LogInformation("Categories received from Eppoi API:");

			var resultCategories = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiCategoriesDTO>>();

            response.EnsureSuccessStatusCode();
			_logger.LogInformation($"Eppoi GetCategoriesAsync response status: {response.StatusCode}");

            return resultCategories ?? Array.Empty<EppoiCategoriesDTO>();
        }

		// GET municipalities from local DB table for frontend use
		public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesAsync()
        {
            var municipalities = await _db.Municipalities
                .Select(m => new EppoiMunicipalitiesDTO
                {
                    LegalName = m.LegalName,
                    ImagePath = m.ImagePath
                })
                .ToListAsync();

            return municipalities;
        }

		// GET municipalities from Eppoi API and save into local DB table if not already present
		public async Task<IEnumerable<EppoiMunicipalitiesDTO>> GetMunicipalitiesIntoDbAsync()
        {
            await EnsureAuthenticatedAsync();
        
            var url = "/api/organizations/municipalities";
        
            var response = await _httpClient.GetAsync(url);
			_logger.LogInformation($"Eppoi GetMunicipalitiesAsync BaseUrl: {url}");
			_logger.LogInformation($"Eppoi GetMunicipalitiesAsync response status: {response.StatusCode}");
            response.EnsureSuccessStatusCode();
        
            // Deserialize JSON response into DTOs
            var result = await response.Content.ReadFromJsonAsync<IEnumerable<EppoiMunicipalitiesDTO>>();
        
			// save to database			
			int addedCount = 0;

			// save to db if not already present
            foreach (var m in result)
            {
                bool exists = _db.Municipalities.Any(x => x.LegalName == m.LegalName);

                if (!exists)
                {
                    _db.Municipalities.Add(new Municipality
                    {
                        LegalName = m.LegalName,
                        ImagePath = m.ImagePath
                    });

                    addedCount++;
                }
            }

            if (addedCount > 0)
                await _db.SaveChangesAsync();

            return result ?? Array.Empty<EppoiMunicipalitiesDTO>();
        }
	}
}
