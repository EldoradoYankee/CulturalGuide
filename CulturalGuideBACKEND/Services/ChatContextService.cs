// Services/ChatContextService.cs
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Data;

namespace CulturalGuideBACKEND.Services
{
    public interface IChatContextService
    {
        Task<string> BuildContextAsync(string municipality, string userId);
    }

    public class ChatContextService : IChatContextService
    {
        private readonly AppDbContext _db;

        public ChatContextService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<string> BuildContextAsync(string municipality, string userId)
        {
            // Get user preferences
            var userPreference = await _db.ProfileVector
                .FirstOrDefaultAsync(p => p.UserId == userId);

            // Get top cards for the municipality
            var topCards = await _db.CardItems
                .Where(c => c.Municipality == municipality)
                .Take(10)
                .Select(c => new { c.EntityName, c.BadgeText, c.Address })
                .ToListAsync();

            var context = $"Municipality: {municipality}\n";
            
            if (userPreference != null)
            {
                context += $"User interests: {userPreference.SelectedCategories}\n";
                context += $"Travel dates: {userPreference.StartTime:yyyy-MM-dd} to {userPreference.EndTime:yyyy-MM-dd}\n";
            }

            if (topCards.Any())
            {
                context += "\nAvailable places:\n";
                foreach (var card in topCards)
                {
                    context += $"- {card.EntityName} ({card.BadgeText}) at {card.Address}\n";
                }
            }

            return context;
        }
    }
}