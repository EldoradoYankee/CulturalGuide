using System;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Controllers;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND;

namespace CulturalGuideBACKEND.Tests.Controllers
{
    public class AuthControllerTests : IDisposable
    {
        private readonly AppDbContext _dbContext;
        private readonly AuthController _authController;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        
        private const string TEST_EMAIL = "unittest@example.com";
        private const string TEST_PASSWORD = "Password123";
        private const string TEST_NAME = "Unit Test User";

        public AuthControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new AppDbContext(options);

            // Setup configuration
            var inMemorySettings = new Dictionary<string, string>
            {
                {"Jwt:Key", "your-256-bit-secret-key-for-testing-purposes-only-must-be-long"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            // Setup password hasher
            _passwordHasher = new PasswordHasher<User>();

            // Setup logger
            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            _logger = loggerFactory.CreateLogger<AuthController>();

            // Create controller
            _authController = new AuthController(
                _dbContext,
                _passwordHasher,
                _configuration,
                _logger
            );
        }

        [Fact]
        public async Task Register_NewUser_ReturnsOkResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result as OkObjectResult;
            okResult.Value.Should().NotBeNull();

            // Verify user was created in database
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == TEST_EMAIL);
            user.Should().NotBeNull();
            user.Name.Should().Be(TEST_NAME);
        }

        [Fact]
        public async Task Register_ExistingUser_ReturnsConflict()
        {
            // Arrange - Create existing user
            var existingUser = new User
            {
                Email = TEST_EMAIL,
                Name = "Existing User",
                EmailVerified = true
            };
            existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, TEST_PASSWORD);
            
            _dbContext.Users.Add(existingUser);
            await _dbContext.SaveChangesAsync();

            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<ConflictObjectResult>();
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                EmailVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var loginRequest = new LoginRequest
            {
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Login(loginRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result as OkObjectResult;
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task Login_InvalidPassword_ReturnsUnauthorized()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                EmailVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var loginRequest = new LoginRequest
            {
                Email = TEST_EMAIL,
                Password = "WrongPassword123"
            };

            // Act
            var result = await _authController.Login(loginRequest);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task DeleteUser_ExistingUser_ReturnsOk()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                EmailVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var userId = user.Id;

            // Act
            var result = await _authController.DeleteUser(userId);

            // Assert
            if (result is StatusCodeResult statusResult)
            {
                statusResult.StatusCode.Should().Be(200);
            }
            else if (result is OkResult)
            {
                Assert.True(true); // OkResult is equivalent to 200
            }
            else if (result is ObjectResult objectResult)
            {
                objectResult.StatusCode.Should().Be(200);
            }
            else
            {
                Assert.Fail($"Expected 200 OK but got {result?.GetType().Name}");
            }

            // Verify user was deleted
            var deletedUser = await _dbContext.Users.FindAsync(userId);
            deletedUser.Should().BeNull();
        }

        [Fact]
        public async Task DeleteUser_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var nonExistentUserId = 99999;

            // Act
            var result = await _authController.DeleteUser(nonExistentUserId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task Register_InvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = "invalid-email",
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }
    }
}