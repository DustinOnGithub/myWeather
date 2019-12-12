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

window.onload = function(){

  let cityId = settings.cities[0];
  let apiHandler = new ApiHandler();
  let dataVirtualizer = new DataVirtualizer();
  let i, li, cityData;
  let navUl = this.document.getElementById('navCities');
  let currentCity = settings.cities[0];

  if(apiHandler.getCurrentWeather() && apiHandler.getForecastWeather()){
    for(i = 0; i < settings.cities.length; i++){
      cityData = apiHandler.getCurrentForCity(settings.cities[i]);
      li = this.document.createElement('li');
      li.innerHTML = cityData.name;
      li.setAttribute('cityId', cityData.id);
      li.onclick = li.ontouchend = function(){
        currentCity = this.getAttribute('cityId');
        updateUi();
      };
      navUl.appendChild(li);
    }

    function updateUi(){
      dataVirtualizer.displayCurrentWeather(apiHandler.getCurrentForCity(currentCity));
      dataVirtualizer.displayForecast5Days(apiHandler.getForecastForCity(currentCity));
    }

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

