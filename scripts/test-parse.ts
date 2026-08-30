// Ročni preizkus parserja na lokalnem fixture-ju, brez omrežnega klica.
// Poženi z: npx tsx scripts/test-parse.ts
import { readFileSync } from "node:fs";
import { parseForecastHtml } from "../lib/parseForecast";

const html = readFileSync("fixtures/forecast_SI_JULIAN-ALPS_long.html", "utf-8");
const data = parseForecastHtml(html);

console.log("regionTitle:", data.regionTitle);
console.log("issuedAt:", data.issuedAt);
console.log("times:", data.times.length, data.times[0], "...", data.times[data.times.length - 1]);
console.log("levels:", Object.keys(data.levels));

const lvl2500 = data.levels[2500];
console.log("\n2500 m, prvih 5 korakov:");
for (let i = 0; i < 5; i++) {
  console.log(
    data.times[i],
    "temp=" + lvl2500.tempC[i],
    "veter=" + lvl2500.windSpeedKmh[i] + "km/h",
    lvl2500.windDir[i],
    "vlaga=" + lvl2500.humidityPct[i] + "%",
    "vreme=" + lvl2500.weatherIcon?.[i]
  );
}

console.log("\nglobalno, prvih 5 korakov:");
for (let i = 0; i < 5; i++) {
  console.log(
    data.times[i],
    "izoterma=" + data.freezingLevelM[i],
    "meja sneženja=" + data.snowLineM[i],
    "stabilnost=" + data.stability[i]
  );
}
