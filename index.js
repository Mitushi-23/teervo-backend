const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios"); 

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8000;

const apiKey = process.env.openWeatherKey;

app.post("/getWeather", async (req, res) => {
  const { cities } = req.body;
  const weatherData = {};

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cities}&appid=${apiKey}&units=metric`
    );
    const data = response.data;

    weatherData[cities] = {
      temperature: `${data.main.temp}°C`,
      humidity: `${data.main.humidity}%`,
      weatherDescription: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    weatherData[cities] = {
      temperature: "Not available",
      humidity: "Not available",
      weatherDescription: "Not available",
      icon: "Not available",
    };
  }

  res.json({ weather: weatherData });
});


app.post("/getFiveDayForecast", async (req, res) => {
  const { city } = req.body;
  console.log(city)
  const forecastData = {};

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastList = response.data.list;
    for (const forecast of forecastList) {
      const date = forecast.dt_txt.split(' ')[0];
      if (!forecastData[date]) {
        forecastData[date] = [];
      }

      forecastData[date].push({
        time: forecast.dt_txt.split(' ')[1],
        temperature: forecast.main.temp,
        weather: forecast.weather[0].description,
        icon: forecast.weather[0].icon
      });
    }
  } catch (error) {
    console.error("Error fetching 5-day forecast data:", error);
  }

  res.json({ forecast: forecastData });
});

app.get("/", (req, res) => {
  res.send("API Running!");
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}...`);
});
