const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var clockArea = null;
var hourEl = null;
var minuteEl = null;
var secondEl = null;
var timeEl = null;
var dateEl = null;
var ampmEl = null;
var wallpaperProperties = { isDark: true };
var timeInterval = null;

export function initClock() {
	console.log("Clock initalization called");
	loadDOMElements();
	setTime();
	timeInterval = setInterval(setTime, 1000);
}

export function setDarkTheme(dark) {
	wallpaperProperties.isDark = dark;
	if (wallpaperProperties.isDark) {
		if (!clockArea.classList.contains('dark'))
			clockArea.classList.add('dark');
	} else {
		if (clockArea.classList.contains('dark'))
			clockArea.classList.remove('dark');
	}
}

export function deleteClock() {
	clockArea = null;
	hourEl = null;
	minuteEl = null;
	secondEl = null;
	timeEl = null;
	dateEl = null;
	ampmEl = null;
	clearInterval(timeInterval);
	// Wallpaper engine doesn't actually let you remove elements from the DOM, apparently
	document.getElementById("clock-area").visible = false;
}

function loadDOMElements() {
	// Wallpaper engine doesn't actually let you remove elements from the DOM, apparently
	clockArea = document.getElementById("clock-area");
	hourEl = document.querySelector('.hour');
	minuteEl = document.querySelector('.minute');
	secondEl = document.querySelector('.second');
	timeEl = document.querySelector('.timestr');
	dateEl = document.querySelector('.date');
	ampmEl = document.querySelector('.ampm-text');
	clockArea.visible = true;
	return;
	// creating elements
	clockArea = document.createElement("div");
	let clockContainer = document.createElement("div");
	let timeContainer = document.createElement("div");
	timeEl = document.createElement("div");
	ampmEl = document.createElement("div");
	dateEl = document.createElement("div");
	let clockEl = document.createElement("div");
	hourEl = document.createElement("div");
	minuteEl = document.createElement("div");
	secondEl = document.createElement("div");
	let centerEl = document.createElement("div");
	// class names
	clockArea.id = "clock-area";
	clockArea.className = wallpaperProperties.isDark ? "dark" : "";
	clockContainer.className = "clock-container";
	timeContainer.className = "time";
	timeEl.className = "timestr";
	ampmEl.className = "ampm-text";
	dateEl.className = "date";
	clockEl.className = "clock";
	hourEl.className = "needle hour";
	minuteEl.className = "needle minute";
	secondEl.className = "needle second";
	centerEl.className = "center-point";
	// inserting to DOM
	document.getElementsByClassName("container")[0].appendChild(clockArea);
	clockArea.appendChild(clockContainer);
	clockContainer.appendChild(timeContainer);
	timeContainer.appendChild(timeEl);
	timeContainer.appendChild(ampmEl);
	clockContainer.appendChild(dateEl);
	clockContainer.appendChild(clockEl);
	clockEl.appendChild(hourEl);
	clockEl.appendChild(minuteEl);
	clockEl.appendChild(secondEl);
	clockEl.appendChild(centerEl);
}

function setTime() {
	const time = new Date();
	const month = time.getMonth();
	const day = time.getDay();
	const date = time.getDate();
	const hours = time.getHours();
	const hoursForClock = (hours == 0) ? 12 : hours % 12;
	const amPM = (hours > 12) ? "PM" : "AM";
	const minutes = time.getMinutes();
	const seconds = time.getSeconds();

	if (hours > 0)
		moveNeedle(hourEl, hoursForClock, 11);
	else
		resetNeedle360(hourEl);
	if (minutes > 0)
		moveNeedle(minuteEl, minutes, 59);
	else
		resetNeedle360(minuteEl);
	if (seconds > 0)
		moveNeedle(secondEl, seconds, 59);
	else
		resetNeedle360(secondEl);
	
	
	timeEl.innerHTML = `${hoursForClock}:${minutes < 10 ? `0${minutes}` : minutes} `;
	ampmEl.innerHTML = amPM;
	dateEl.innerHTML = `${days[day]}, ${months[month]} <span class="circle"> ${date} </span>`;
}

// StackOverflow https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function moveNeedle(needle, num, max_num) {
	needle.style.transform = `translate(-50%, -100%) rotate(${scale(num, 0, max_num, 0, 360)}deg)`;
}

// Workaround the 360 needle thingy
function resetNeedle360(needle) {
	needle.style.transform = `translate(-50%, -100%) rotate(359.9999deg)`;
   let oldTransition = needle.style.transitionDuration;
	needle.style.transitionDuration = '0s';
	needle.style.transform = `translate(-50%, -100%) rotate(0deg)`;
	setTimeout(() => {
	needle.style.transitionDuration = oldTransition;
	}, 500)
}