// Server component that fetches current weather from Open-Meteo on the server
// so no API key or network call is exposed to the browser.
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current=temperature_2m,weathercode,relativehumidity_2m&timezone=Asia/Kolkata";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weathercode?: number;
    relativehumidity_2m?: number;
  };
};

function emojiForWeatherCode(code: number | undefined): string {
  if (code === undefined || Number.isNaN(code)) return "🌡️";
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code === 95) return "⛈️";
  return "🌡️";
}

async function fetchWeather(): Promise<
  | {
      temperature: number;
      humidity: number;
      weatherCode: number | undefined;
    }
  | null
> {
  try {
    const res = await fetch(WEATHER_URL, {
      // Revalidate every 30 minutes so the widget stays fresh without
      // hammering the public API.
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as OpenMeteoResponse;
    const temperature = data.current?.temperature_2m;
    const humidity = data.current?.relativehumidity_2m;
    const weatherCode = data.current?.weathercode;

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number"
    ) {
      return null;
    }

    return { temperature, humidity, weatherCode };
  } catch {
    // Swallow errors and let the UI fall back to a friendly message.
    return null;
  }
}

export default async function WeatherWidget() {
  const weather = await fetchWeather();

  if (!weather) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-200">
        <span>Delhi 🇮🇳</span>
        <span className="text-xs text-slate-400">Weather unavailable</span>
      </div>
    );
  }

  const icon = emojiForWeatherCode(weather.weatherCode);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-100 shadow-sm shadow-slate-950/40">
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Delhi 🇮🇳
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold">
            {Math.round(weather.temperature)}°C
          </span>
          <span className="text-[11px] text-slate-300">
            · {Math.round(weather.humidity)}% humidity
          </span>
        </span>
      </div>
    </div>
  );
}

