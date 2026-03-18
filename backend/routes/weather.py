import os
import time
import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/weather", tags=["Weather"])

# Simple in-memory cache: { "city": { "data": {...}, "timestamp": float } }
_cache = {}
CACHE_TTL = 1800  # 30 minutes


@router.get("/")
async def get_weather(city: str = None):
    """Get current weather for a city using OpenWeather API."""
    api_key = os.getenv("OPENWEATHER_API_KEY", "")
    city = city or os.getenv("DEFAULT_CITY", "Hyderabad")

    if not api_key or api_key == "YOUR_OPENWEATHER_KEY_HERE":
        return {
            "city": city,
            "temp": None,
            "description": "Weather unavailable",
            "icon": "01d",
            "error": "OpenWeather API key not configured. Add OPENWEATHER_API_KEY to .env"
        }

    # Check cache
    cache_key = city.lower()
    now = time.time()
    if cache_key in _cache and (now - _cache[cache_key]["timestamp"]) < CACHE_TTL:
        return _cache[cache_key]["data"]

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": api_key, "units": "metric"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        result = {
            "city": data.get("name", city),
            "temp": round(data["main"]["temp"]),
            "feels_like": round(data["main"]["feels_like"]),
            "description": data["weather"][0]["description"].title(),
            "icon": data["weather"][0]["icon"],
            "humidity": data["main"]["humidity"],
        }

        # Cache it
        _cache[cache_key] = {"data": result, "timestamp": now}
        return result

    except httpx.HTTPStatusError as e:
        return {
            "city": city,
            "temp": None,
            "description": "Weather unavailable",
            "icon": "01d",
            "error": f"API error: {e.response.status_code}"
        }
    except Exception as e:
        return {
            "city": city,
            "temp": None,
            "description": "Weather unavailable",
            "icon": "01d",
            "error": str(e)
        }
