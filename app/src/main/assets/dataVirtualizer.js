class DataVirtualizer{

    constructor(){
        let i;
        this.cache = [];
        //quick and dirty to fix bug:
        this.currentCity = false;
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

        this.ctx5daysForecast = document.getElementById('forecast5DaysCanvas');
        Chart.defaults.global.defaultFontColor = 'black';
        Chart.defaults.global.defaultFontSize = 15;
        
    }

    displayCurrentWeather(data){
        let calculationTime, sunsetTime, sunriseTime;
 
        //only update gui if data is also updated
        if(this.currentCity != data.id ||
            !this.cache[data.id].lastUpdate || this.cache[data.id].lastUpdate < data.dt){

            this.currentCity = data.id;

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
        let days, i, labels = [], datasets;

        //only update gui if data is also updated
        if(!this.cache[data.city.id].lastUpdate || 
            (new Date().getTime() - this.cache[data.city.id].lastUpdate) > UPDATE_INTERVAL)
        {
            this.cache[data.city.id].lastUpdate = new Date().getTime();
            console.debug('update forecast gui');

            datasets = [
                {
                    label: 'Min',
                    data: [],
                    borderColor: 'darkblue',
                    backgroundColor: '#00008bab',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'AVG',
                    data: [],
                    borderColor:'black',
                    backgroundColor: '#0000008f',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Max',
                    data: [],
                    borderColor: 'red',
                    backgroundColor: '#ff00004f',
                    borderWidth: 2,
                    fill: true
                }
            ];

            days = this.calcAvgPerDay(data);

            for(i = 0; i < days.length; i++){
                datasets[0].data.push(days[i].temp_min);
                datasets[1].data.push(days[i].temp);
                datasets[2].data.push(days[i].temp_max); 
                labels.push(days[i].dayString);
            }

            var chart = new Chart(this.ctx5daysForecast,{
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options:{
                    title: {
                        display: true,
                        text: 'Temperatur in Celsius',
                        position: 'bottom'
                    },
                    maintainAspectRatio: false
                }
            });

            chart.canvas.parentNode.style.height = '300px';
        }
    }

    calcAvgPerDay(data){
        let item, index, days = [], today = new Date(), time;

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
                        dayString: time.toGermanDayShort(),
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
                    if(days[index].temp_min > data.list[item].main.temp_min)
                        days[index].temp_min = data.list[item].main.temp_min;
                    if(days[index].temp_max < data.list[item].main.temp_max)
                        days[index].temp_max = data.list[item].main.temp_max;
                    days[index].pressure += data.list[item].main.pressure;
                    days[index].sea_level += data.list[item].main.sea_level;
                    days[index].grnd_level += data.list[item].main.grnd_level;
                    days[index].humidity += data.list[item].main.humidity;
                }
            }
        }

        for(index = 0; index < days.length; index++){

            days[index].temp = (Math.round(days[index].temp / days[index].numberOfData)) / 100;
            days[index].pressure = days[index].pressure / days[index].numberOfData;
            days[index].sea_level = days[index].sea_level / days[index].numberOfData
            days[index].grnd_level = days[index].grnd_level / days[index].numberOfData
            days[index].humidity = days[index].humidity / days[index].numberOfData
        }

        return days;
    }

    displayForecast24Hours(data){

    }
}