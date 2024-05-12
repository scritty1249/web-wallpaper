# web-wallpaper
Web wallpaper made for wallpaper engine

## Credit
Rain effect: https://github.com/codrops/RainEffect \
Clock: https://steamcommunity.com/sharedfiles/filedetails/?id=3119179287

## Known Issues
- None of the options for toggling both the clock and the background work in wallpaper engine, but they work in a normal browser (using chrome)
- The animation easing when any clock hand strikes 12 doesn't work in wallpaper engine, but works in a normal browser (causing the needle to snap to the next increment instantly, instead of moving smoothly)
- parallax effect completely broken
- WebGL compiler removes inactive attibutes, causing warnings when they are indexed even when they no longer exist
