/**
 * @var {object} settings
 */

Date.prototype.toString = function(){
  return this.getHours() +':' + this.getMinutes() + ':' + this.getSeconds() + ' ' + this.getDate()+'.'+this.getMonth()+'.'+this.getFullYear();
};

Date.prototype.toTimeString = function(){
  return this.getHours() +':' + this.getMinutes();
};

Date.prototype.toGermanDayShort = function () {
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
  document.getElementById('loading').style = 'display: none';
  document.getElementsByTagName('main')[0].style = 'display: inline';
}


/**
 * using recursion -> using setTimeout 
 * -> enough time for the html to calculate the size of the li
 * there could be a nicer solution with css
 */
function displayCity(navUl, apiHandler, cityIndex, offset = 0) {

  let cityData = apiHandler.getCurrentForCity(settings.cities[cityIndex]);

  let li = this.document.createElement('li');
  li.innerHTML = cityData.name;
  li.setAttribute('cityId', cityData.id);
  
  if(offset > 0)
    li.style.left = (offset) + "px"; 
  else
    li.setAttribute('id', 'selectedCity');
  
  li.ontouchend = function(){
    currentCity = this.getAttribute('cityId');
    document.getElementById('selectedCity').removeAttribute('id');
    this.setAttribute('id', 'selectedCity');
    updateUi(true);
  };
  
  navUl.appendChild(li);

  if(++cityIndex < settings.cities.length){
    setTimeout(function () {
      displayCity(navUl, apiHandler, cityIndex, offset + li.offsetWidth + 20);
    },50);
  }
}

let apiHandler = new ApiHandler();
let dataVirtualizer = new DataVirtualizer();
let currentCity;

function updateUi(force = false){
  dataVirtualizer.displayCurrentWeather(apiHandler.getCurrentForCity(currentCity), force);
  dataVirtualizer.displayForecast5Days(apiHandler.getForecastForCity(currentCity), force);
}

window.onload = function(){

  let navUl = this.document.getElementById('navCities');
  currentCity = settings.cities[0];

  if(apiHandler.getCurrentWeather() && apiHandler.getForecastWeather()){
    
    this.displayCity(navUl, apiHandler, 0);

    hideLoadingPage();
    updateUi();

    let updateLoop = setInterval(() => {
      updateUi();
    }, 5000);
  }
  else{
    let p = document.createElement('p')
    p.innerText = "No weather data available!";
    p.style = 'color: red;';
    document.getElementById('name').appendChild(p);
    this.hideLoadingPage();
  }
}