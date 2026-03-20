const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get weather forecast
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Check cache (less than 1 hour old)
    const cached = await pool.query(
      `SELECT * FROM weather_cache 
       WHERE location = $1 
       AND cached_at > NOW() - INTERVAL '1 hour'
       ORDER BY cached_at DESC LIMIT 1`,
      [location]
    );

    if (cached.rows.length > 0) {
      return res.json({ ...cached.rows[0], cached: true });
    }

    // Fetch from external API
    try {
      const currentWeather = await axios.get(
        `${process.env.WEATHER_API_URL}/weather`,
        {
          params: {
            q: location,
            appid: process.env.WEATHER_API_KEY,
            units: 'metric'
          },
          timeout: 5000
        }
      );

      const forecast = await axios.get(
        `${process.env.WEATHER_API_URL}/forecast`,
        {
          params: {
            q: location,
            appid: process.env.WEATHER_API_KEY,
            units: 'metric'
          },
          timeout: 5000
        }
      );

      const weatherData = {
        location,
        temperature: currentWeather.data.main.temp,
        rainfall: currentWeather.data.rain?.['1h'] || 0,
        humidity: currentWeather.data.main.humidity,
        wind_speed: currentWeather.data.wind.speed,
        forecast_data: forecast.data
      };

      // Cache the data
      await pool.query(
        `INSERT INTO weather_cache (location, temperature, rainfall, humidity, wind_speed, forecast_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [weatherData.location, weatherData.temperature, weatherData.rainfall, 
         weatherData.humidity, weatherData.wind_speed, JSON.stringify(weatherData.forecast_data)]
      );

      res.json({ ...weatherData, cached: false });
    } catch (apiError) {
      // Return stale cache if API fails
      const staleCache = await pool.query(
        'SELECT * FROM weather_cache WHERE location = $1 ORDER BY cached_at DESC LIMIT 1',
        [location]
      );

      if (staleCache.rows.length > 0) {
        return res.json({ ...staleCache.rows[0], cached: true, stale: true });
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

module.exports = router;
