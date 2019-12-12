class DataVirtualizer{

    constructor(){
        let i;
        this.cache = [];
        
        this.currentCity = false;
        for(i = 0; i < settings.cities.length; i++){
            this.cache.push({
                city: settings.cities[i],
                current: {
                    lastUpdate: false
                },
                forecast: {
                    lastUpdate: false
                }
            });
        }

        this.ctx5daysForecast = document.getElementById('forecast5DaysCanvas');
        Chart.defaults.global.defaultFontColor = 'black';
        Chart.defaults.global.defaultFontSize = 15;
        
    }

    displayCurrentWeather(data){
        let calculationTime, sunsetTime, sunriseTime, cacheIndex;
 
        cacheIndex = this.cache.findCacheIndex(data.id);

        //only update gui if data is also updated
        if(this.currentCity != data.id ||
            !this.cache[cacheIndex].current.lastUpdate || this.cache[cacheIndex].current.lastUpdate < data.dt){

            this.currentCity = data.id;
            this.cache[cacheIndex].current.lastUpdate = data.dt;

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
        }
    }

    displayForecastWeather(data){
        
    }

    displayForecast5Days(data){

        let index = this.cache.findCacheIndex(data.city.id);

        //only update gui if data is also updated
        if(this.currentCity != data.city.id ||
            !this.cache[index].forecast.lastUpdate || 
            this.cache[index].forecast.lastUpdate < data.list[0].dt
        ){

            this.currentCity = data.id;
            this.cache[index].forecast.lastUpdate = data.list[0].dt;

            console.debug('update forecast gui');

            this.displayForecast5Days_temperature(data);
            this.displayForecast5Days_weather(data);
        }
    }

    displayForecast5Days_temperature (data){
        let days, i, labels = [], datasets;


        datasets = this.chartOption_forecast5Day;

        days = this.calcAvgTempPerDay(data);

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
                    position: 'bottom'
                },
                layout: {
                    padding:{
                        bottom: -45
                    }
                },
                maintainAspectRatio: false
            }
        });

        chart.canvas.parentNode.style.height = '300px';
    }

    displayForecast5Days_weather (data){

        let item, time, dIndex, wIndex, days = [], today = new Date(), avgWeather;

        //count the weather types per day
        for(item = 0; item < data.list.length; item++){
            time = new Date(data.list[item].dt * 1000);

            //skip current day
            if(today.getDay() != time.getDay()){
                dIndex = days.findDayIndex(time);

                if(dIndex == -1){
                    days.push({
                        day: time.getDay(),
                        time: time,
                        weathers: [],
                        avgWeather: '',
                        avgIcon: ''
                    });
                    dIndex = days.length - 1;
                }

                wIndex = days[dIndex].weathers.findWeatherIndex(data.list[item].weather[0].main);
                
                if(wIndex == -1){
                    days[dIndex].weathers.push(
                        {
                            main: '',
                            description: '',
                            icon: '',
                            number: 0
                        }
                    );
                    wIndex = days[dIndex].weathers.length - 1;
                    days[dIndex].weathers[wIndex].main = data.list[item].weather[0].main;
                    days[dIndex].weathers[wIndex].description = data.list[item].weather[0].description;
                    days[dIndex].weathers[wIndex].icon = parseInt(data.list[item].weather[0].icon);
                }

                days[dIndex].weathers[wIndex].number++;
            }
        }

        //get the weather with the highest count and display the icon for it:)
        for (const day of days) {
            avgWeather = 0;
            for (const weather of day.weathers) {
                if(avgWeather < weather.number){
                    avgWeather = weather.number;
                    day.avgIcon = weather.icon;
                    day.avgWeather = weather.main;
                }
            }
        }

        let htmlIcons = document.getElementById('forecast5Days')
            .getElementsByTagName('tbody')[0].getElementsByTagName('td');
        let i = 0;

        for (const day of days) {
            htmlIcons[i].getElementsByTagName('img')[0].src = 'icons/'+day.avgIcon+'d.png';
            i++;
        }
    }

    calcAvgTempPerDay(data){
        let item, index, days = [], today = new Date(), time;

        for(item = 0; item < data.list.length; item++){
            time = new Date(data.list[item].dt * 1000);

            //skip current day
            if(today.getDay() != time.getDay()){

                index = days.findIndex((day) => {
                    return day.day == time.getDay();
                });

                index = days.findDayIndex(time);

                if(index == -1){
                    days.push({
                        day: time.getDay(),
                        dayString: time.toGermanDayShort(),
                        numberOfData: 0,
                        temp: 0,
                        temp_min: 100,
                        temp_max: 0,
                        pressure: 0,
                        sea_level: 0,
                        grnd_level: 0,
                        humidity: 0,
                    });
                    index = days.length - 1;
                }
                
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

    chartOption_forecast5Day = [
        {
            label: 'Min',
            data: [],
            borderColor: 'darkblue',
            backgroundColor: '#00008b8c',
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
            backgroundColor: '#ff040475',
            borderWidth: 2,
            fill: true
        }
    ];
}