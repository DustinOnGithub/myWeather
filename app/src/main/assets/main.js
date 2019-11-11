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

function getCurrentWeather(cityId){

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4){  
      switch(this.status) {
        case 200:

          let response = JSON.parse(this.response);

          console.log(response);

          let calculationTime = new Date(response.dt * 1000);
          let sunriseTime = new Date(response.sys.sunrise * 1000);
          let sunsetTime = new Date(response.sys.sunset * 1000);

          document.getElementById('name').innerText = response.name;
          document.getElementById('temp').innerText = 'aktuelle temp: ' + response.main.temp + '° C';
          document.getElementById('tempMax').innerText = 'max temp: ' + response.main.temp_max + '° C';
          document.getElementById('tempMin').innerText = 'min temp: ' + response.main.temp_min + '° C';
          document.getElementById('humidity').innerText = 'Luftfeuchtigkeit: ' + response.main.humidity + " %";
          document.getElementById('windSpeed').innerText = 'wind speed: ' + response.wind.speed + ' m/s';
          document.getElementById('windDegree').innerText = 'wind Richtung: ' + response.wind.deg + ' °';
          document.getElementById('sunrise').innerText = 'Sonnenaufgang: ' + sunriseTime.toTimeString();
          document.getElementById('sunset').innerText = 'Sonnenuntergang: ' + sunsetTime.toTimeString();
          document.getElementById('txt').innerText = response.weather[0].description;
          document.getElementById('time').innerText = 'Zeit: ' + calculationTime.toString()
          
          break;
      
        case 401:
          alert("unauthorized! probably api-key is invalid");
          break;
        case 429:
          alert('to many requests to open weather! Try it later...');
          break;
        case 500:
          alert("Server error! Try it later...");
          break;
      }

      document.getElementById('loading').style = 'display: none';
      document.getElementsByTagName('main')[0].style = 'display: inline';
    }
  };

  xhttp.open("GET", "http://api.openweathermap.org/data/2.5/weather?APPID="+settings.apiKey+"&id="+ cityId +"&units=metric" + XMLHttpRequest.noCacheStr(), true);
  xhttp.send();

}

window.onload = function(){

  let cityId = settings.cities[0];
  this.getCurrentWeather(cityId);

}

