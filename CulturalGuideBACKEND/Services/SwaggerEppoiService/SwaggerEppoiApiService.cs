using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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

        public SwaggerEppoiApiService(IHttpClientFactory httpClientFactory, IConfiguration config,
            ILogger<SwaggerEppoiApiService> logger, AppDbContext db)
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
            
            _logger.LogInformation(
                $"Eppoi GetEatAndDrinksAsync response: {result.Count()} items received for municipality: {municipality}");

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
        // EATANDDRINK DETAIL (SINGLE ITEM)
        // =====================
        public async Task<object> GetEatAndDrinkDetailAsync(string id, string language)
        {
            await EnsureAuthenticatedAsync();

            // Endpoint call: /api/eat-and-drink/detail/{identifier}
            var url = $"/api/eat-and-drink/detail/{id}?language={language}";

            _logger.LogInformation($"Eppoi GetEatAndDrinkDetailAsync calling: {url}");

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    $"Eppoi GetEatAndDrinkDetailAsync failed with status: {response.StatusCode} for ID: {id}");
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<object>();
            return result;
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

        public async Task<IEnumerable<EppoiUnifiedCardDTO>> GetCardsAsync(string[] municipalities, string[] languages, string[] endpoints)
        {
            var allResults = new List<EppoiUnifiedCardDTO>();
            
            // ---------------------
            // For each municipality, get all cards (each category)
            // ---------------------
            foreach (var municipality in municipalities)
            {
                foreach (var language in languages)
                {
                    foreach (var endpoint in endpoints)
                    {
                        try
                        {
                            var url =
                                $"https://apispm.eppoi.io/api/{endpoint}/card-list?municipality={Uri.EscapeDataString(municipality)}&language=it";

                            _logger.LogInformation($"Calling Eppoi API: {url}");

                            var response = await _httpClient.GetAsync(url);

                            _logger.LogInformation($"Eppoi {endpoint} response status: {response.StatusCode}");

                            if (!response.IsSuccessStatusCode)
                            {
                                _logger.LogWarning(
                                    $"Failed to fetch {endpoint} for {municipality} (it): {response.StatusCode}");
                                continue;
                            }

                            var content = await response.Content.ReadAsStringAsync();
                            var items = JsonSerializer.Deserialize<List<EppoiUnifiedCardDTO>>(content,
                                new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true
                                });

                            if (items != null && items.Any())
                            {
                                foreach (var item in items)
                                {
                                    item.Language = language;
                                    item.Municipality = municipality;
                                }

                                allResults.AddRange(items);
                                _logger.LogInformation(
                                    $"Fetched {items.Count} items from {endpoint} for {municipality} (it)");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Error fetching {endpoint} for {municipality} (it)");
                        }
                    }
                }
            }

            _logger.LogInformation($"Total items fetched: {allResults.Count}");

            // ---------------------
            // Save to the database with better error handling
            // ---------------------
            var savedCount = 0;
            var skippedCount = 0;
            var errorCount = 0;

            
            foreach (var dto in allResults)
            {
                try
                {
                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(dto.EntityId))
                    {
                        _logger.LogWarning($"Skipping item with null/empty EntityId: {dto.EntityName}");
                        errorCount++;
                        continue;
                    }
                    if (string.IsNullOrWhiteSpace(dto.Language))
                    {
                        _logger.LogWarning($"Skipping item with null/empty Language: {dto.EntityName} ({dto.EntityId})");
                        errorCount++;
                        continue;
                    }
                    if (string.IsNullOrWhiteSpace(dto.Municipality))
                    {
                        _logger.LogWarning($"Skipping item with null/empty Municipality: {dto.EntityName} ({dto.EntityId})");
                        errorCount++;
                        continue;
                    }

                    // Check if item already exists
                    bool exists = await _db.CardItems.AnyAsync(x =>
                        x.EntityId == dto.EntityId &&
                        x.Language == dto.Language &&
                        x.Municipality == dto.Municipality
                    );

                    if (exists)
                    {
                        skippedCount++;
                        continue;
                    }

                    _logger.LogInformation($"Adding item to database: {dto.EntityName}");

                    // Truncate fields that might be too long
                    var entity = new CardItem
                    {
                        EntityId = TruncateString(dto.EntityId!, 255),
                        EntityName = TruncateString(dto.EntityName, 500),
                        ImagePath = TruncateString(dto.ImagePath, 1000),
                        BadgeText = TruncateString(dto.BadgeText, 255),
                        Address = TruncateString(dto.Address, 500),
                        Classification = TruncateString(dto.Classification, 255),
                        Date = DateTime.TryParse(dto.Date, out var d) ? d : null,
                        MunicipalityName = TruncateString(dto.MunicipalityData?.LegalName, 255),
                        MunicipalityLogoPath = TruncateString(dto.MunicipalityData?.ImagePath, 1000),
                        Language = TruncateString(dto.Language, 10),
                        Municipality = TruncateString(dto.Municipality, 255),
                        CreatedAt = DateTime.UtcNow
                    };

                    _db.CardItems.Add(entity);
                    await _db.SaveChangesAsync();
                    savedCount++;
                    _logger.LogInformation($"Entity saved: {savedCount} items so far...");
                }
                catch (DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, $"Database error saving item: {dto.EntityName} ({dto.EntityId})");
                    _logger.LogError($"Inner exception: {dbEx.InnerException?.Message}");
                    errorCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error saving item: {dto.EntityName} ({dto.EntityId})");
                    errorCount++;
                }
            }

            // Save any remaining items
            try
            {
                //await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving final batch to database");
            }
            
            _logger.LogInformation($"Database operation complete: {savedCount} saved, {skippedCount} skipped, {errorCount} errors");

            return allResults;
        }
        
        // Helper method to truncate strings
        private string TruncateString(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value))
                return value;
    
            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }
        
    }
}
