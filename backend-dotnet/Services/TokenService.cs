using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TempleManagementApi.Models;

namespace TempleManagementApi.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateJwtToken(Devotee devotee)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "a_very_long_secret_key_that_needs_to_be_32_bytes_at_least");
            var tokenHandler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, devotee.DevoteeID.ToString()),
                    new Claim(ClaimTypes.Name, devotee.FullName),
                    new Claim(ClaimTypes.Email, devotee.Email),
                    new Claim(ClaimTypes.Role, "Devotee")
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(descriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
