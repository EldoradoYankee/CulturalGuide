using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CulturalGuideBACKEND.Services.SwaggerEppoiService;
using CulturalGuideBACKEND.DTO.SwaggerEppoiDTO;

namespace CulturalGuideBACKEND.Services
{
    public class AppStartupService : IHostedService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<AppStartupService> _logger;

        public AppStartupService(IServiceProvider services, ILogger<AppStartupService> logger)
        {
            _services = services;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation(">>> App startup service running...");

            try
            {
                // Create scope because ISwaggerEppoiApiService is scoped
                using var scope = _services.CreateScope();

                string municipality = "Massignano";
                string language = "it";

                var eppoiService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();

                _logger.LogInformation(">>> Calling GetCategoriesAsync on startup...");

                var categories = await eppoiService.GetCategoriesAsync(municipality, language);

                _logger.LogInformation($">>> Categories received: {categories.Count()}");

                foreach (var c in categories)
                {
                    _logger.LogInformation($" - Category: {c.Category}, Label: {c.Label}, ImagePath: {c.ImagePath}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error calling GetCategoriesAsync on startup");
            }

            // invoke GetMunicipalitiesAsync at every startup to warm up the db
            try
            {
                using var scope = _services.CreateScope();
                var eppoiService = scope.ServiceProvider.GetRequiredService<ISwaggerEppoiApiService>();
                await eppoiService.GetMunicipalitiesIntoDbAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ">>> Error calling GetMunicipalitiesAsync on startup");
            }

            _logger.LogInformation(">>> Startup service finished.");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            // Nothing to clean up
            return Task.CompletedTask;
        }
    }
}
