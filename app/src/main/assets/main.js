/**
 * @var {object} settings
 */

 const DEBUG = settings.debug && !navigator.userAgent.includes ('wv');

if(!DEBUG){
  console.debug = function(){}
}

/*
call by coordinate,  neumarkt:
http://api.openweathermap.org/data/2.5/forecast?lat=49.283333&lon=11.466667&APPID=2d0ef47dd6f57d424a0c05dd812c0170&units=metric&noCache=kxouz

*/

Date.prototype.toString = function(){
  return this.getHours() +':' + this.getMinutes() + ':' + this.getSeconds() + ' ' + this.getDate()+'.'+this.getMonth()+'.'+this.getFullYear();
};

Date.prototype.toTimeString = function(){
  let hours = this.getHours(), minutes = this.getMinutes();
  hours = hours < 10 ? ('0'+hours) : hours;
  minutes = minutes < 10 ? ('0'+minutes) : minutes;
  return hours +':' + minutes;
};

Date.prototype.toDayAndTimeString = function () {
  return this.toGermanDayShort()+' '+this.toTimeString();
}

Date.prototype.toGermanDayShort = function (useToday = false) {

  if(useToday && this.getDay() == new Date().getDay()){
    return 'Heute';
  }

  switch(this.getDay()){
    case 0: return 'Son';
    case 1: return 'Mon';
    case 2: return 'Die';
    case 3: return 'Mit';
    case 4: return 'Don';
    case 5: return 'Fre';
    case 6: return 'Sam';
    default: return 'undefined';
  }
};

Array.prototype.findWeatherIndex = function (weather) {
  return this.findIndex((item) => {
    return item.main == weather;
  });
}

Array.prototype.findDayIndex = function (currentTime){
  return this.findIndex((item) => {
      return item.day == currentTime.getDay();
  });
}

Array.prototype.findCacheIndex = function (city) {
  return this.findIndex((item) => {
    return item.city == city;
  });
}

XMLHttpRequest.noCacheStr = function(){
  return '&noCache=' + Math.random().toString(36).substring(7);
}

function hideLoadingPage() {
  let loadingElem = document.getElementById('loading');
  loadingElem.style = 'display: none;';
  loadingElem.getElementsByTagName('div')[0].style = 'animation-play-state: paused;';
  document.getElementsByTagName('main')[0].style = 'display: inline';
}

function displayCities() {

  document.getElementById('addLocation').className = ';'
  let navUl = this.document.getElementById('navCities');
  let cityData, li, onTouchOrClick;

  for(const city of settings.cities){
    
    cityData = apiHandler.getCurrentForCity(city);

    li = this.document.createElement('li');
    li.innerHTML = cityData.name;
    li.setAttribute('cityId', cityData.id);

    if(currentCity == city)
      li.setAttribute('id', 'selectedCity');

    onTouchOrClick = function(){
      currentCity = this.getAttribute('cityId');
      document.getElementById('selectedCity').removeAttribute('id');
      this.setAttribute('id', 'selectedCity');
      updateUi(true);
    };

    if(DEBUG)
      li.onclick = onTouchOrClick;
    else
      li.ontouchend = onTouchOrClick; // webview, so bind touch event

    navUl.appendChild(li);
  }
}

let apiHandler = new ApiHandler();
let dataVirtualizer = new DataVirtualizer();
let currentCity;

function updateUi(force = false){
  dataVirtualizer.displayCurrentWeather(apiHandler.getCurrentForCity(currentCity), force);
  dataVirtualizer.displayForecast5Days(apiHandler.getDailyForecastForCity(currentCity), force);
  dataVirtualizer.displayForecast3HourInterval(apiHandler.getHourlyForecastForCity(currentCity), force);
}

window.onload = function(){

  let apiKey = settings.apiKey;
  if(apiKey){
    let x = "";
    for(let i = 0; i < apiKey.length - 16; i++){
      x += "x";
    }
    document.getElementById('apiKey').innerText = apiKey.substr(0, 8) + x + apiKey.substr(-8);
  } else{
    document.getElementById('apiKey').innerText = "no api key defined!";
  }

  currentCity = settings.cities[0];
  if(apiHandler.getCurrentWeather() && apiHandler.getDailyForecast() && apiHandler.getHourlyForecast()){

  if("geolocation" in this.navigator) {
      let locationManager = new LocationManager();
      locationManager.addLocationEvent();
    }
    else{
      if(DEBUG) console.log("no geolocation!");
      else      Android.showToast("Standortzugriff ist nicht möglich!");
    }

    this.displayCities();
    updateUi();
    document.getElementsByTagName('main')[0].style = 'display: block';
    hideLoadingPage();

    let updateLoop = setInterval(() => {
      updateUi();
    }, 5000);
  }
  else{
    let p = document.createElement('p');
    p.innerText = "No weather data available!";
    p.style = 'color: red;';
    document.getElementsByTagName('main')[0].appendChild(p);
    hideLoadingPage();
  }
}

//-------- kotlin -> js interface:
function setCoordinates(latitude, longitude){
  console.log("coordinate: " + latitude);
  document.getElementById('coordinates').innerText = "coordinates: " + latitude + " - " + longitude;
}