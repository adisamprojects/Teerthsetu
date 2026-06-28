FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend-dotnet/backend-dotnet.csproj", "backend-dotnet/"]
RUN dotnet restore "backend-dotnet/backend-dotnet.csproj"
COPY ["backend-dotnet/", "backend-dotnet/"]
RUN dotnet publish "backend-dotnet/backend-dotnet.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "backend-dotnet.dll"]
