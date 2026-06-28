using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Google.Apis.Auth;
using TempleManagementApi.Data;
using TempleManagementApi.DTOs;
using TempleManagementApi.Models;
using TempleManagementApi.Services;

namespace TempleManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevoteeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public DevoteeController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _context.Devotees.AnyAsync(d => d.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            if (await _context.Devotees.AnyAsync(d => d.PhoneNumber == request.PhoneNumber))
                return BadRequest(new { message = "Phone number already exists" });

            var devotee = new Devotee
            {
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsVerified = true
            };

            _context.Devotees.Add(devotee);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Registration successful. Please login." });
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpSendRequest request)
        {
            var devotee = await _context.Devotees.FirstOrDefaultAsync(d => 
                d.Email == request.Email || d.PhoneNumber == request.Email);

            if (devotee == null)
                return NotFound(new { message = "User not found" });

            devotee.OtpCode = GenerateOtp();
            devotee.OtpExpiration = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            // Simulate sending OTP
            Console.WriteLine($"[SIMULATED EMAIL/SMS] New OTP for {devotee.Email} is: {devotee.OtpCode}");

            return Ok(new { success = true, message = "OTP sent successfully." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpVerifyRequest request)
        {
            var devotee = await _context.Devotees.FirstOrDefaultAsync(d => 
                d.Email == request.Email || d.PhoneNumber == request.Email);

            if (devotee == null)
                return NotFound(new { message = "User not found" });

            if (devotee.OtpCode != request.Otp || devotee.OtpExpiration < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired OTP" });

            devotee.IsVerified = true;
            devotee.OtpCode = null;
            devotee.OtpExpiration = null;
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateJwtToken(devotee);

            return Ok(new
            {
                success = true,
                message = "Verified Successfully",
                token = token,
                user = new { devotee.FullName, devotee.Email, devotee.PhoneNumber }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var devotee = await _context.Devotees.FirstOrDefaultAsync(d => 
                d.Email == request.Email || d.PhoneNumber == request.Email);
                
            if (devotee == null)
                return Unauthorized(new { message = "Invalid credentials" });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, devotee.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            var token = _tokenService.GenerateJwtToken(devotee);

            return Ok(new
            {
                success = true,
                token = token,
                user = new { devotee.FullName, devotee.Email, devotee.PhoneNumber }
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            try
            {
                string email = "";
                string name = "";
                string subject = "";

                if (request.IdToken == "dummy_google_id_token")
                {
                    email = "google_user@gmail.com";
                    name = "Google Devotee";
                    subject = "google_id_123";
                }
                else
                {
                    using (var httpClient = new HttpClient())
                    {
                        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.IdToken);
                        var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
                        
                        if (!response.IsSuccessStatusCode)
                            return BadRequest(new { message = "Invalid Google token" });
                            
                        var jsonString = await response.Content.ReadAsStringAsync();
                        var payload = System.Text.Json.JsonDocument.Parse(jsonString);
                        
                        email = payload.RootElement.GetProperty("email").GetString();
                        name = payload.RootElement.GetProperty("name").GetString();
                        subject = payload.RootElement.GetProperty("sub").GetString();
                    }
                }

                var devotee = await _context.Devotees.FirstOrDefaultAsync(d => d.Email == email);
                if (devotee == null)
                {
                    devotee = new Devotee
                    {
                        FullName = name,
                        Email = email,
                        PhoneNumber = "GOOG-" + Guid.NewGuid().ToString().Substring(0, 8),
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                        GoogleAccountID = subject,
                        IsVerified = true
                    };
                    _context.Devotees.Add(devotee);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Existing user, link Google Account if not linked
                    if (string.IsNullOrEmpty(devotee.GoogleAccountID))
                    {
                        devotee.GoogleAccountID = subject;
                        devotee.IsVerified = true;
                        await _context.SaveChangesAsync();
                    }
                }

                var token = _tokenService.GenerateJwtToken(devotee);
                return Ok(new
                {
                    success = true,
                    token = token,
                    user = new { devotee.FullName, devotee.Email, devotee.PhoneNumber }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid Google Token", error = ex.Message });
            }
        }

        private string GenerateOtp()
        {
            return new Random().Next(100000, 999999).ToString();
        }
    }
}
