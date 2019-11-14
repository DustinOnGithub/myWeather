/**
 * @var {object} settings
 */

Date.prototype.toString = function(){
  return this.getHours() +':' + this.getMinutes() + ':' + this.getSeconds() + ' ' + this.getDate()+'.'+this.getMonth()+'.'+this.getFullYear();
}

Date.prototype.toTimeString = function(){
  return this.getHours() +':' + this.getMinutes();
}

XMLHttpRequest.noCacheStr = function(){
  return '&noCache=' + Math.random().toString(36).substring(7);
}

window.onload = function(){

  let cityId = settings.cities[0];
  let apiHandler = new ApiHandler();
  let dataVirtualizer = new DataVirtualizer();
  let i, li, cityData;
  let navUl = this.document.getElementById('navCities');
  let currentCity = settings.cities[0];

  if(apiHandler.getCurrentWeather()){
    for(i = 0; i < settings.cities.length; i++){
      cityData = apiHandler.getCurrentForCity(settings.cities[i]);
      li = this.document.createElement('li');
      li.innerHTML = cityData.name;
      li.setAttribute('cityId', cityData.id);
      li.onclick = function(){
        currentCity = this.getAttribute('cityId');
        updateUi();
      };
      navUl.appendChild(li);
    }

    function updateUi(){
      dataVirtualizer.displayCurrentWeather(apiHandler.getCurrentForCity(currentCity));
    }

    updateUi();

    let updateLoop = setInterval(() => {
      updateUi();
    }, 5000);
  }
  else{
    let p = this.document.createElement('p')
    p.innerText = "No weather data available!";
    p.style = 'color: red;';
    this.document.getElementById('name').appendChild(p);
  }
}

