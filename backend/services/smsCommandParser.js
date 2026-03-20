const pool = require('../config/database');
const axios = require('axios');

class SMSCommandParser {
  async parseAndExecute(message, phoneNumber) {
    const command = message.trim().toUpperCase();
    const parts = command.split(' ').filter(part => part.length > 0);

    if (parts.length === 0) {
      return this.getHelpMessage();
    }

    const commandType = parts[0];

    try {
      switch (commandType) {
        case 'PRICE':
          return await this.handlePriceCommand(parts);
        case 'WEATHER':
          return await this.handleWeatherCommand(parts);
        case 'HELP':
          return this.getHelpMessage();
        default:
          return `Unknown command: ${commandType}. Send HELP for available commands.`;
      }
    } catch (error) {
      console.error('Error processing SMS command:', error);
      return 'Error processing your request. Please try again later.';
    }
  }

  async handlePriceCommand(parts) {
    // PRICE WHEAT or PRICE TEFF ADDIS
    if (parts.length < 2) {
      return 'Usage: PRICE [CROP] or PRICE [CROP] [MARKET]';
    }

    const cropName = parts[1];
    const marketName = parts.length > 2 ? parts.slice(2).join(' ') : null;

    try {
      let query;
      let params;

      if (marketName) {
        // Get price for specific crop and market
        query = `
          SELECT c.name as crop, m.name as market, m.region, p.price, p.date_updated
          FROM prices p
          JOIN crops c ON p.crop_id = c.id
          JOIN markets m ON p.market_id = m.id
          WHERE UPPER(c.name) LIKE $1 AND UPPER(m.name) LIKE $2
          ORDER BY p.date_updated DESC
          LIMIT 1
        `;
        params = [`%${cropName}%`, `%${marketName}%`];
      } else {
        // Get prices for crop across all markets
        query = `
          SELECT c.name as crop, m.name as market, m.region, p.price, p.date_updated
          FROM prices p
          JOIN crops c ON p.crop_id = c.id
          JOIN markets m ON p.market_id = m.id
          WHERE UPPER(c.name) LIKE $1
          ORDER BY p.date_updated DESC
          LIMIT 5
        `;
        params = [`%${cropName}%`];
      }

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return `No price information found for ${cropName}${marketName ? ' in ' + marketName : ''}.`;
      }

      if (result.rows.length === 1) {
        const row = result.rows[0];
        return `${row.crop} - ${row.market}, ${row.region}: ${row.price} ETB (Updated: ${new Date(row.date_updated).toLocaleDateString()})`;
      }

      // Multiple results
      let response = `${result.rows[0].crop} prices:\n`;
      result.rows.forEach(row => {
        response += `${row.market}: ${row.price} ETB\n`;
      });
      return response.trim();
    } catch (error) {
      console.error('Error fetching price:', error);
      return 'Error fetching price information.';
    }
  }

  async handleWeatherCommand(parts) {
    // WEATHER or WEATHER BAHIRDAR
    const location = parts.length > 1 ? parts.slice(1).join(' ') : 'Addis Ababa';

    try {
      const apiKey = process.env.WEATHER_API_KEY;
      const apiUrl = process.env.WEATHER_API_URL;

      if (!apiKey) {
        return 'Weather service not configured.';
      }

      const response = await axios.get(`${apiUrl}/weather`, {
        params: {
          q: location,
          appid: apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const description = data.weather[0].description;
      const windSpeed = data.wind.speed;

      return `Weather in ${location}:\nTemp: ${temp}°C\nCondition: ${description}\nHumidity: ${humidity}%\nWind: ${windSpeed} m/s`;
    } catch (error) {
      console.error('Error fetching weather:', error);
      if (error.response?.status === 404) {
        return `Location "${location}" not found. Please check spelling.`;
      }
      return 'Error fetching weather information.';
    }
  }

  getHelpMessage() {
    return `AgriConnect SMS Commands:
PRICE [CROP] - Get crop prices
PRICE [CROP] [MARKET] - Get price at specific market
WEATHER [LOCATION] - Get weather forecast
HELP - Show this message

Example: PRICE WHEAT ADDIS`;
  }
}

module.exports = new SMSCommandParser();