class DataVirtualizer{


    displayCurrentWeather(data){
        let calculationTime = new Date(data.dt * 1000);
        let sunsetTime = new Date(data.sys.sunset * 1000);
        let sunriseTime = new Date(data.sys.sunrise * 1000);
 
        document.getElementById('temp').innerText = 'aktuelle temp: ' + data.main.temp + '° C';
        document.getElementById('tempMax').innerText = 'max temp: ' + data.main.temp_max + '° C';
        document.getElementById('tempMin').innerText = 'min temp: ' + data.main.temp_min + '° C';
        document.getElementById('humidity').innerText = 'Luftfeuchtigkeit: ' + data.main.humidity + " %";
        document.getElementById('windSpeed').innerText = 'wind speed: ' + data.wind.speed + ' m/s';
        document.getElementById('windDegree').innerText = 'wind Richtung: ' + data.wind.deg + ' °';
        document.getElementById('sunrise').innerText = 'Sonnenaufgang: ' + sunriseTime.toTimeString();
        document.getElementById('sunset').innerText = 'Sonnenuntergang: ' + sunsetTime.toTimeString();
        document.getElementById('txt').innerText = data.weather[0].description;
        document.getElementById('time').innerText = 'Zeit: ' + calculationTime.toString()
        document.getElementById('name').innerText = data.name;

     }
}