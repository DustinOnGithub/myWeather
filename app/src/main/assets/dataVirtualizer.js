class Dom{

    constructor(){

        this.modifyStdClasses();
        this.currentCity = false;
        this.page = 0;

        this.ctx5daysForecast = document.getElementById('forecast5DaysCanvas');
        Chart.defaults.global.defaultFontColor = 'white';
        Chart.defaults.global.defaultFontSize = 15;
    }

    update(){
        this.displayCurrentWeather();
        this.displayForecast5Days();
    }

    dataReady(){
        return cache.cities[this.page].current.dt !== false; //the first api call has not finished
    }

    displayCurrentWeather(force = false){
        if(!this.dataReady()) return;

        let  current = cache.cities[this.page].current
            ,calculationTime = new Date(current.dt * 1000)
            ,sunsetTime = new Date(current.sunset * 1000)
            ,sunriseTime = new Date(current.sunrise * 1000)
        ;

        document.getElementById('currentWeatherImg').src = 'icons/' + current.weather[0].icon+'.png';
        document.getElementById('temp').innerText = current.temp + '° C';
        document.getElementById('feelsLike').innerText = current.feels_like + '° C';
        document.getElementById('uvi').innerText = current.uvi;
        document.getElementById('pressure').innerText = current.pressure + " hPa";
        document.getElementById('humidity').innerText = current.humidity + " %";
        document.getElementById('windSpeed').innerText = current.wind_speed + ' m/s';
        document.getElementById('windDegree').innerText = this.degreeToCompass(current.wind_deg);
        document.getElementById('sunrise').innerText = sunriseTime.toTimeString();
        document.getElementById('sunset').innerText = sunsetTime.toTimeString();
        document.getElementById('time').innerText = calculationTime.toTimeString();
    }

    displayForecast5Days(data, force = false){ //todo: rename. no more 5 days. 7!
        if(!this.dataReady()) return;

        let daily = cache.cities[this.page].daily;
        let trElements = 
            document.getElementById('forecast5Days')
            .getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        let i = 0;
        let date = undefined;
        let run = 0;

        for(const day of daily){
            
            if(run++ == 0) continue;

            date = new Date(day.dt*1000);
            console.log(day);

            trElements[0]
                .getElementsByClassName('day')[i]
                .innerText = date.toGermanDayShort(true);

            
            trElements[1]
                .getElementsByTagName('td')[i]
                .getElementsByTagName('img')[0]
                .src = 'icons/'+day.weather[0].icon+'d.png';

            trElements[2]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('maxTemp')[0]
                .innerText = Math.round(day.temp.max) + '°';

                trElements[3]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('avgTemp')[0] //todo: this not the avg temp!
                .innerText = Math.round(day.temp.day) + '°';


            trElements[4]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('minTemp')[0]
                .innerText = Math.round(day.temp.min) + '°';

            trElements[5]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('humidity')[0]
                .innerText = day.humidity + '%';

            //todo: display more information like uv-index

            i++;
            
        }
    }

    

    displayForecast5Days_chart (data){
        return;
        
        let days, i = 0, labels = [], datasets;

        // 'clone' object:
        datasets = JSON.parse(JSON.stringify(this.chartOption_forecast5Day));

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

    displayForecast5Days_table (data){

        return;
        let item, time, dIndex, wIndex, days = [], today = new Date(), avgWeather;

        //count the weather types per day
        for(item = 0; item < data.list.length; item++){
            time = new Date(data.list[item].dt * 1000);

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

        let trElements = document.getElementById('forecast5Days')
            .getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        let i = 0;

        for (const day of days) {

            trElements[0]
                .getElementsByClassName('day')[i+1]
                .innerText = day.time.toGermanDayShort(true);

            trElements[1]
                .getElementsByTagName('td')[i]
                .getElementsByTagName('img')[0]
                .src = 'icons/'+day.avgIcon+'d.png';
            i++;
        }

        days = this.calcAvgTempPerDay(data);
        i = 0;

        for (const day of days) {
            trElements[2]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('maxTemp')[0]
                .innerText = Math.round(day.temp_max) + '°';

            trElements[3]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('avgTemp')[0]
                .innerText = Math.round(day.temp) + '°';

            trElements[4]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('minTemp')[0]
                .innerText = Math.round(day.temp_min) + '°';
    

            trElements[5]
                .getElementsByTagName('td')[i]
                .getElementsByClassName('humidity')[0]
                .innerText = Math.round(day.humidity) + '%';
            i++;
        }

    }

    displayForecast3HourInterval(data, force = false){
        return;
        
        console.debug(data);
        let index = this.cache.findCacheIndex(data.city.id);

        if(!force &&
            this.currentCity == data.city.id &&
            this.cache[index].forecast3HourInterval.lastUpdate && 
            this.cache[index].forecast3HourInterval.lastUpdate >= data.list[0].dt
        )
        {
            return;
        }

        this.currentCity = data.city.id;
        this.cache[index].forecast3HourInterval.lastUpdate = data.list[0].dt;

        let trElements = document.getElementById('forecast3HourInterval')
            .getElementsByTagName('tr');

        let oldElements = document.querySelectorAll("#forecast3HourInterval td");
        oldElements.forEach(el => el.remove());
    
        let timeElem = document.createElement('td');
        timeElem.className += ' time'
        timeElem.appendChild(document.createElement('span'));

        let weatherElem = document.createElement('td');
        weatherElem.className += ' weather'
        weatherElem.appendChild(document.createElement('img'));

        let maxTempElem = document.createElement('td');
        maxTempElem.className += ' maxTemp';
        maxTempElem.appendChild(document.createElement('span'));

        let avgTempElem = document.createElement('td');
        avgTempElem.className += ' avgTemp';
        avgTempElem.appendChild(document.createElement('span'));

        let feelTempElem = document.createElement('td');
        feelTempElem.className += ' feelTemp';
        feelTempElem.appendChild(document.createElement('span'));

        let minTempElem = document.createElement('td');
        minTempElem.className += ' minTemp';
        minTempElem.appendChild(document.createElement('span'));

        let humidityElem = document.createElement('td');
        humidityElem.className += ' humidity';
        humidityElem.appendChild(document.createElement('span'));
        
        let windSpeedElem = document.createElement('td');
        windSpeedElem.className += ' windSpeed';
        windSpeedElem.appendChild(document.createElement('span'));

        let windDegreeElem = document.createElement('td');
        windDegreeElem.className += ' windDegree';
        windDegreeElem.appendChild(document.createElement('span'));

        let weatherClone, timeClone, maxTempClone, avgTempClone, feelTempClone, minTempClone,
            humidityClone, windSpeedClone, windDegreeClone, date;

        for(const hour of data.list)
        {
            date = new Date(hour.dt * 1000);

            timeClone = timeElem.cloneNode(true);
            timeClone.getElementsByTagName('span')[0].innerText = date.toDayAndTimeString();
            trElements[0].appendChild(timeClone);

            weatherClone = weatherElem.cloneNode(true);
            weatherClone.getElementsByTagName('img')[0].src = 'icons/' + hour.weather[0].icon+'.png';
            trElements[1].appendChild(weatherClone);

            maxTempClone = maxTempElem.cloneNode(true);
            maxTempClone.getElementsByTagName('span')[0].innerText = hour.main.temp_max + '°';
            trElements[2].appendChild(maxTempClone);
            
            avgTempClone = avgTempElem.cloneNode(true);
            avgTempClone.getElementsByTagName('span')[0].innerText = hour.main.temp + '°';
            trElements[3].appendChild(avgTempClone);

            feelTempClone = feelTempElem.cloneNode(true);
            feelTempClone.getElementsByTagName('span')[0].innerText = hour.main.feels_like + '°';
            trElements[4].appendChild(feelTempClone);

            minTempClone = minTempElem.cloneNode(true);
            minTempClone.getElementsByTagName('span')[0].innerText = hour.main.temp_min + '°';
            trElements[5].appendChild(minTempClone);

            humidityClone = humidityElem.cloneNode(true);
            humidityClone.getElementsByTagName('span')[0].innerText = hour.main.humidity + '%';
            trElements[6].appendChild(humidityClone);

            windSpeedClone = windSpeedElem.cloneNode(true);
            windSpeedClone.getElementsByTagName('span')[0].innerText = hour.wind.speed + 'm/s';
            trElements[7].appendChild(windSpeedClone);

            windDegreeClone = windDegreeElem.cloneNode(true);
            windDegreeClone.getElementsByTagName('span')[0].innerText = this.degreeToCompass(hour.wind.deg);
            trElements[8].appendChild(windDegreeClone);
        }
    }

    calcAvgTempPerDay(data){

        return;
        let item, index, days = [], today = new Date(), time;

        for(item = 0; item < data.list.length; item++){
            time = new Date(data.list[item].dt * 1000);

            index = days.findIndex((day) => {
                return day.day == time.getDay();
            });

            index = days.findDayIndex(time);

            if(index == -1){
                days.push({
                    day: time.getDay(),
                    dayString: time.toGermanDayShort(true),
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

        for(index = 0; index < days.length; index++){
            days[index].temp = (Math.round(days[index].temp / days[index].numberOfData)) / 100;
            days[index].pressure = days[index].pressure / days[index].numberOfData;
            days[index].sea_level = days[index].sea_level / days[index].numberOfData
            days[index].grnd_level = days[index].grnd_level / days[index].numberOfData
            days[index].humidity = days[index].humidity / days[index].numberOfData
        }

        return days;
    }

    degreeToCompass(deg){
        if(deg < 22.5 || deg > 337.5)
            return 'N';
        else if(22.5 < deg && deg < 67.5)
            return 'NO';
        else if(67.5 < deg && deg < 112.5)
            return 'O';
        else if(112.5 < deg && deg < 157.5)
            return 'SO';
        else if(157.5 < deg && deg < 202.5)
            return 'S';
        else if(202.5 < deg && deg < 247.5)
            return 'SW';
        else if(247,5 < deg && deg < 292.5)
            return 'W';
        else if(292,5 < deg && deg < 337.5)
            return 'NW';
        else
            return deg;
    }

    hideLoadingPage() {
        let loadingElem = document.getElementById('loading');
        loadingElem.style = 'display: none;';
        loadingElem.getElementsByTagName('div')[0].style = 'animation-play-state: paused;';
        document.getElementsByTagName('main')[0].style = 'display: inline';
    }

    displayCities() {

        document.getElementById('addLocation').className = ';'
        let navUl = this.document.getElementById('navCities');
        let cityData, li, onTouchOrClick;

        for(const city of cache.cities){
            
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

    updateUi(force = false){
        displayCurrentWeather(force);
        displayForecast5Days(force);
        displayForecast3HourInterval(force);
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
            borderColor:'white',
            backgroundColor: '#f5f5f53d',
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

    modifyStdClasses(){
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
        
            if(useToday && this.getDay() == new Date().getDay()){ //todo: check also date!!
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
    }
}