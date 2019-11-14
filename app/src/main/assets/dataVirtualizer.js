class DataVirtualizer{

    constructor(){
        let i;
        this.cache = [];
        for(i = 0; i < settings.cities.length; i++){
            this.cache[settings.cities[i]] = {
                city: settings.cities[i],
                current: {
                    lastUpdate: false
                },
                forecast: {
                    lastUpdate: false
                }
            }
        }
    }

    displayCurrentWeather(data){
        let calculationTime, sunsetTime, sunriseTime;
 
        //only update gui if data is also updated
        if(!this.cache[data.id].lastUpdate || this.cache[data.id].lastUpdate < data.dt){
            
            this.cache[data.id].lastUpdate = data.dt;

            calculationTime = new Date(data.dt * 1000);
            sunsetTime = new Date(data.sys.sunset * 1000);
            sunriseTime = new Date(data.sys.sunrise * 1000);
            
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

    displayForecastWeather(data){
        
    }

    displayForecast5Days(data){
        let days;

        //only update gui if data is also updated
        if(!this.cache[data.city.id].lastUpdate || 
            (new Date().getTime() * 1000 - this.cache[data.city.id].lastUpdate) > CURRENT_UPDATE_INTERVAL)
        {
            this.cache[data.city.id].lastUpdate = new Date().getTime() * 1000;
            console.debug('update forecast gui');

            days = this.calcAvgPerDay(data);

            console.log(days);
        }
    }

    calcAvgPerDay(data){
        let item, index, days = [], today = new Date();

        for(item = 0; item < data.list.length; item++){
            time = new Date(data.list[item].dt * 1000);

            //skip current day
            if(today.getDay() != time.getDay()){

                index = days.findIndex((day) => {
                    return day.day == time.getDay();
                });

                if(index == -1){
                    days.push({
                        day: time.getDay(),
                        numberOfData: 0,
                        temp: 0,
                        temp_min: 0,
                        temp_max: 0,
                        pressure: 0,
                        sea_level: 0,
                        grnd_level: 0,
                        humidity: 0,
                    });
                }
                else{
                    days[index].numberOfData++;
                    days[index].temp += data.list[item].main.temp * 100;
                    days[index].temp_min += data.list[item].main.temp_min * 100;
                    days[index].temp_max += data.list[item].main.temp_max * 100;
                    days[index].pressure += data.list[item].main.pressure;
                    days[index].sea_level += data.list[item].main.sea_level;
                    days[index].grnd_level += data.list[item].main.grnd_level;
                    days[index].humidity += data.list[item].main.humidity;
                }
            }
        }

        return days;
    }

    displayForecast24Hours(data){

    }
}