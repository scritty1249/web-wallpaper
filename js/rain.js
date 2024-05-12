import RainRenderer from "./modules/rain-renderer.js";
import Raindrops from "./modules/raindrops.js";
import loadImages from "./modules/image-loader.js";
import createCanvas from "./modules/create-canvas.js";
import gsap from './modules/gsap-core.js';
import times from './modules/times.js';
import { random, chance } from './modules/random.js';

const overrideProperties = {
    // Weather data properties
    raining: "raining",
    rainchance: "rainChance",
    rainlimit: "rainLimit",
    dropletsrate: "dropletsRate",
    trailrate: "trailRate",
    flashchance: "flashChance"
};
let textureRainFg, textureRainBg,
    textureDrizzleFg, textureDrizzleBg,
    dropColor, dropAlpha;

let textureFg,
    textureFgCtx,
    textureBg,
    textureBgCtx;

let textureBgSize = {
    width: 384,
    height: 256
}
let textureFgSize = {
    width: 96,
    height: 64
}

let raindrops,
    renderer,
    canvas;

let parallax = { x: 0, y: 0 };

let weatherData = null;
let curWeatherData = null;
let blend = { v: 0 };
let wallpaperProperties = {};
let weatherOverrides = {};
let flashInterval = null;

function importRainProperty(property, value) {
    wallpaperProperties[property] = value;
    if (Object.keys(overrideProperties).includes(property))
        weatherOverrides[overrideProperties[property]] = value;
}

export function initRain() {
    console.log("Rain initalization called");
    if (canvas == null) {
        loadDOMElements();
        loadTextures();
        window.onresize = function (event) {
            // broken
            resizeCanvas();
        }
    } else {
        loadTextures();
    }
}

export function updateRain(property, value) {
    importRainProperty(property, value);
    // redrawing everything isn't super efficient so I'll fix it later if it's too laggy
}

export function deleteRain() {
    textureRainFg = null;
    textureRainBg = null;
    textureDrizzleFg = null;
    textureDrizzleBg = null;
    dropColor = null;
    dropAlpha = null;
    textureFg = null;
    textureFgCtx = null;
    textureBg = null;
    textureBgCtx = null;
    raindrops = null;
    renderer = null;
    canvas = null;
    weatherData = null;
    curWeatherData = null;
    blend = { v: 0 };
    parallax = { x: 0, y: 0 };
    textureBgSize = {
        width: 384,
        height: 256
    };
    textureFgSize = {
        width: 96,
        height: 64
    };
    clearInterval(flashInterval);
    flashInterval = null;
    // Wallpaper engine doesn't actually let you remove elements from the DOM, apparently
    [...document.getElementsByClassName("rain")].forEach((element) => {
        element.visible = false;
    });
}

function loadDOMElements() {
    // Wallpaper engine doesn't actually let you remove elements from the DOM, apparently
    [...document.getElementsByClassName("rain")].forEach((element) => {
        element.visible = true;
    });
    return;

    let containerElem = document.getElementsByClassName("container")[0];
    // canvas element
    canvas = document.createElement("canvas");
    canvas.id = "container";
    canvas.classList.add("rain");
    // error banner
    let errorBanner = document.createElement("p");
    errorBanner.innerHTML = "Sorry, but your browser does not support WebGL!";
    errorBanner.classList.add("rain", "nosupport");
    // insert
    containerElem.appendChild(canvas);
    containerElem.appendChild(errorBanner);
}

function loadTextures() {
    loadImages([
        { name: "dropAlpha", src: "img/drop-alpha.png" },
        { name: "dropColor", src: "img/drop-color.png" },

        { name: "textureRainFg", src: "img/weather/texture-rain-fg.png" },
        { name: "textureRainBg", src: "img/weather/texture-rain-bg.png" }
    ]).then((images) => {
        textureRainFg = images.textureRainFg.img;
        textureRainBg = images.textureRainBg.img;

        dropColor = images.dropColor.img;
        dropAlpha = images.dropAlpha.img;

        init();
    });
}

function init() {
    canvas = document.querySelector('#container');

    let dpi = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpi;
    canvas.height = window.innerHeight * dpi;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    raindrops = new Raindrops(
        canvas.width,
        canvas.height,
        dpi,
        dropAlpha,
        dropColor, {
        trailRate: 1,
        trailScaleRange: [0.2, 0.45],
        collisionRadius: 0.45,
        dropletsCleaningRadiusMultiplier: 0.28,
    }
    );

    textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
    textureFgCtx = textureFg.getContext('2d');
    textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
    textureBgCtx = textureBg.getContext('2d');

    generateTextures(textureRainFg, textureRainBg);

    renderer = new RainRenderer(canvas, raindrops.canvas, textureFg, textureBg, null, {
        brightness: 1.04,
        alphaMultiply: 6,
        alphaSubtract: 3,
        // minRefraction:256,
        // maxRefraction:512
    });

    setupEvents();
}

function resizeCanvas() {
    // Doesn't account for css size, just overwrites those values... might cause problems later idk
    let dpi = window.devicePixelRatio;
    var oldHeight = canvas.height,
        oldWidth = canvas.width,
        newHeight = window.innerHeight * dpi,
        newWidth = window.innerWidth * dpi;
    var scaleHeight = newHeight / oldHeight,
        scaleWidth = newWidth / oldWidth;
    if (scaleHeight != 1 && scaleWidth != 1) {
        raindrops = new Raindrops(
            canvas.width,
            canvas.height,
            dpi,
            dropAlpha,
            dropColor, {
            trailRate: 1,
            trailScaleRange: [0.2, 0.45],
            collisionRadius: 0.45,
            dropletsCleaningRadiusMultiplier: 0.28,
        }
        );

        textureFgCtx.scale(scaleWidth, scaleHeight);
        textureBgCtx.scale(scaleWidth, scaleHeight);
        textureFgSize.width *= scaleWidth;
        textureFgSize.height *= scaleHeight;
        textureBgSize.width *= scaleWidth;
        textureBgSize.height *= scaleHeight;

        generateTextures(textureRainFg, textureRainBg);
        renderer = new RainRenderer(canvas, raindrops.canvas, textureFg, textureBg, null, {
            brightness: 1.04,
            alphaMultiply: 6,
            alphaSubtract: 3,
            // minRefraction:256,
            // maxRefraction:512
        });

        setupEvents();
        console.log("resized");
    }
}

function setupEvents() {
    setupParallax(); // borked
    setupWeather();
    setupFlash();
}
function setupParallax() {
    if (!wallpaperProperties.parallax)
        // Wallpaper engine for some reason sometimes only sends events to the document body instead of the whole document
        // See details: https://steamcommunity.com/app/431960/discussions/1/1471967615869337414/
        //document.body.addEventListener('mousemove', (event) => {
        document.addEventListener('mousemove', (event) => {
            let x = event.pageX;
            let y = event.pageY;

            gsap.to(parallax, {
                duration: 1,
                x: ((x / canvas.width) * 2) - 1,
                y: ((y / canvas.height) * 2) - 1,
                ease: "power1.out",
                onUpdate: () => {
                    renderer.parallaxX = parallax.x;
                    renderer.parallaxY = parallax.y;
                }
            })
        });
}
function setupFlash() {
    // mostly unused, unless defined is wallpaper engine properties
    flashInterval = setInterval(() => {
        if (chance(curWeatherData.flashChance)) {
            flash(curWeatherData.bg, curWeatherData.fg, curWeatherData.flashBg, curWeatherData.flashFg);
        }
    }, 500)
}
function setupWeather() {
    setupWeatherData();
    window.addEventListener("hashchange", (event) => {
        updateWeather();
    });
    updateWeather();
}
function setupWeatherData() {
    let defaultWeather = {
        raining: true,
        minR: 20,
        maxR: 50,
        rainChance: 0.35,
        rainLimit: 6,
        dropletsRate: 50,
        dropletsSize: [3, 5.5],
        trailRate: 1,
        trailScaleRange: [0.25, 0.35],
        fg: textureRainFg,
        bg: textureRainBg,
        flashFg: null,
        flashBg: null,
        flashChance: 0,
        collisionRadiusIncrease: 0.0002
    };

    function weather(data) {
        return Object.assign({}, defaultWeather, data);
    }

    weatherData = {
        rain: weather({
            rainChance: 0.35,
            dropletsRate: 50,
            raining: true,
            // trailRate:2.5,
            fg: textureRainFg,
            bg: textureRainBg
        }),
        drizzle: weather({
            minR: 10,
            maxR: 40,
            rainChance: 0.15,
            rainLimit: 2,
            dropletsRate: 10,
            dropletsSize: [3.5, 6],
            fg: textureDrizzleFg,
            bg: textureDrizzleBg
        })
    };
}
function updateWeather() {
    if (!Object.keys(weatherData).includes(wallpaperProperties.weather)) {
        throw new Error(`Weather data not found for key: ${wallpaperProperties.weather}`);
        return;
    }
    let data = weatherData[wallpaperProperties.weather];
    curWeatherData = { ...data, ...weatherOverrides };

    raindrops.options = Object.assign(raindrops.options, data)

    raindrops.clearDrops();

    gsap.fromTo(blend, {
        duration: 1,
        v: 0
    }, {
        v: 1,
        onUpdate: () => {
            generateTextures(data.fg, data.bg, blend.v);
            renderer.updateTextures();
        }
    })
}

function flash(baseBg, baseFg, flashBg, flashFg) {
    let flashValue = { v: 0 };
    function transitionFlash(to, t = 0.025) {
        return new Promise((resolve, reject) => {
            gsap.to(flashValue, {
                duration: t,
                v: to,
                ease: "power1.out",
                onUpdate: () => {
                    generateTextures(baseFg, baseBg);
                    generateTextures(flashFg, flashBg, flashValue.v);
                    renderer.updateTextures();
                },
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    let lastFlash = transitionFlash(1);
    times(random(2, 7), (i) => {
        lastFlash = lastFlash.then(() => {
            return transitionFlash(random(0.1, 1))
        })
    })
    lastFlash = lastFlash.then(() => {
        return transitionFlash(1, 0.1);
    }).then(() => {
        transitionFlash(0, 0.25);
    });

}
function generateTextures(fg, bg, alpha = 1) {
    textureFgCtx.globalAlpha = alpha;
    textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);

    textureBgCtx.globalAlpha = alpha;
    textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
}