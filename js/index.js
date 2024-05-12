import { initRain, updateRain, deleteRain } from "./rain.js";
import { initClock, setDarkTheme, deleteClock } from "./clock.js";

// defualt values since wallpaper engine is being weird
const defaults = {
    rain_enable: true,
    rain_weather: "rain",
    rain_parallax: true,
    clock_enable: true,
    clock_dark: true,
};
window.onload = (event) => applyProperties(defaults);


window.wallpaperPropertyListener = {
    applyUserProperties: applyProperties
};
export function applyProperties(properties) {
    var rainInit = null;
    for (var [property, value] of Object.entries(properties)) {
        let prop = property.split("_", 2).pop().trim();
        if (property.startsWith("clock_")) {
            if (prop == "enable") {
                if (value) {
                    initClock();
                } else {
                    deleteClock();
                }
            } else if (prop == "dark") {
                setDarkTheme(value);
            } else {
                console.log(`unreconized clock property: (${property}: ${value})`);
            }
        } else if (property.startsWith("rain_")) {
            rainInit = (rainInit === null) ? true : rainInit;
            if (prop == "enable") {
                if (!value) {
                    deleteRain();
                    rainInit = false;
                }
            } else {
                updateRain(prop, value);
            }
        }
    }
    if (rainInit === true)
        initRain();
}