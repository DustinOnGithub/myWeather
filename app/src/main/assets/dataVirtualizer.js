const UPDATE_INTERVAL = 600000;// 10 minutes, recommend

class Dom{
    //todo: graph for hourly forecast
    //todo: display minutely forecast
    constructor(){

        this.modifyStdClasses();
        this.currentCity = false;
        this.page = 0;
        this.displayedPage = -1;
        this.apiHandler = new ApiHandler();
        this.request = undefined;

        this.ctx5daysForecast = document.getElementById('forecast5DaysCanvas');
        Chart.defaults.global.defaultFontColor = 'white';
        Chart.defaults.global.defaultFontSize = 15;
    }

    update(self){

        if(self == undefined) self = this;

        if(cache.cities[self.page].current.dt === false
            || (new Date().getTime() - new Date(cache.cities[self.page].current.dt).getTime()) > UPDATE_INTERVAL)
        {
            if(self.request instanceof XMLHttpRequest){
                if(self.request.readyState != XMLHttpRequest.DONE){
                    setTimeout(self.update, 20, self);
                    return;
                }
            }else{
                self.request = this.apiHandler.oneCall(cache.cities[self.page]);
                setTimeout(self.update, 20, self);
                return;
            }
        }

        if(self.displayedPage != self.page){
            if(self.displayedPage == -1){
                self.hideLoadingPage();
                self.displayCities();
            }
            
            self.displayCurrentWeather();
            self.displayDailyForecast();
            self.displayHourlyForecast();
            self.request = undefined;
            self.displayedPage = self.page;
            setTimeout(self.update, 3000, self);
        }
    }

    dataReady(){
        return cache.cities[this.page].current.dt !== false; //the first api call has not finished
    }

    displayCurrentWeather(){
        if(!this.dataReady()) return;

        let  current = cache.cities[this.page].current
            ,updateTime = new Date(current.dt)
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
        document.getElementById('time').innerText = updateTime.toTimeString();
    }

    displayDailyForecast(){
        if(!this.dataReady()) return;

        let run = 0
            ,i = 0
            ,date = undefined
            ,rainAvailable = false
            ,snowAvailable = false
            ,chartLabels = []
            ,chartData = JSON.parse(JSON.stringify(this.chartOption_forecastDaily)) // 'clone' object
            ,trElements = 
                document.getElementById('dailyForecast')
                .getElementsByTagName('tbody')[0].getElementsByTagName('tr')
        ;

        for(const day of cache.cities[this.page].daily){
            
            if(run++ == 0) continue;

            date = new Date(day.dt*1000);

            chartLabels.push(date.toGermanDayShort(true));

            this.displayDailyForecastTable(trElements, day, i, date);
            this.collectDataForDailyForecastChart(chartData, day);

            if(!rainAvailable && typeof day.rain === 'number') rainAvailable = true;
            if(!snowAvailable && typeof day.snow === 'number') snowAvailable = true;

            i++;
        }

        if(rainAvailable)
            document.getElementById('rainTr').classList.remove('hidden');
        else
            document.getElementById('rainTr').classList.add('hidden');

        if(snowAvailable)
            document.getElementById('snowTr').classList.remove('hidden');
        else
            document.getElementById('snowTr').classList.add('hidden');

        this.createDailyForecastChart(chartLabels, chartData)
    }

    displayHourlyForecast(){

        let trElements, oldElements, timeElem, weatherElem, tempElem, feelTempElem, humidityElem, windSpeedElem, windDegreeElem, 
            weatherClone, timeClone, tempClone, feelTempClone, humidityClone, windSpeedClone, windDegreeClone, date
        ;

        trElements = document.getElementById('hourlyForecastHolder')
        .getElementsByTagName('tr');

        oldElements = document.querySelectorAll("#hourlyForecastHolder td");
        oldElements.forEach(el => el.remove());
    
        timeElem = document.createElement('td');
        timeElem.className += ' time'
        timeElem.appendChild(document.createElement('span'));

        weatherElem = document.createElement('td');
        weatherElem.className += ' weather'
        weatherElem.appendChild(document.createElement('img'));

        tempElem = document.createElement('td');
        tempElem.className += ' avgTemp';
        tempElem.appendChild(document.createElement('span'));

        feelTempElem = document.createElement('td');
        feelTempElem.className += ' feelTemp';
        feelTempElem.appendChild(document.createElement('span'));

        humidityElem = document.createElement('td');
        humidityElem.className += ' humidity';
        humidityElem.appendChild(document.createElement('span'));
        
        windSpeedElem = document.createElement('td');
        windSpeedElem.className += ' windSpeed';
        windSpeedElem.appendChild(document.createElement('span'));

        windDegreeElem = document.createElement('td');
        windDegreeElem.className += ' windDegree';
        windDegreeElem.appendChild(document.createElement('span'));

        for(const hour of cache.cities[this.page].hourly){

            date = new Date(hour.dt * 1000);

            timeClone = timeElem.cloneNode(true);
            timeClone.getElementsByTagName('span')[0].innerText = date.toDayAndTimeString();
            trElements[0].appendChild(timeClone);

            weatherClone = weatherElem.cloneNode(true);
            weatherClone.getElementsByTagName('img')[0].src = 'icons/' + hour.weather[0].icon+'.png';
            trElements[1].appendChild(weatherClone);
            
            tempClone = tempElem.cloneNode(true);
            tempClone.getElementsByTagName('span')[0].innerText = hour.temp + '°';
            trElements[2].appendChild(tempClone);

            feelTempClone = feelTempElem.cloneNode(true);
            feelTempClone.getElementsByTagName('span')[0].innerText = hour.feels_like + '°';
            trElements[3].appendChild(feelTempClone);

            humidityClone = humidityElem.cloneNode(true);
            humidityClone.getElementsByTagName('span')[0].innerText = hour.humidity + '%';
            trElements[4].appendChild(humidityClone);

            windSpeedClone = windSpeedElem.cloneNode(true);
            windSpeedClone.getElementsByTagName('span')[0].innerText = hour.wind_speed + 'm/s';
            trElements[5].appendChild(windSpeedClone);

            windDegreeClone = windDegreeElem.cloneNode(true);
            windDegreeClone.getElementsByTagName('span')[0].innerText = this.degreeToCompass(hour.wind_deg);
            trElements[6].appendChild(windDegreeClone);
        }
    }

    /**
     * @param {HTMLCollectionOf<HTMLTableRowElement>} trElements 
     * @param {object} day
     * @param {number} i
     */
    displayDailyForecastTable(trElements, day, i, date){

        trElements[0]
            .getElementsByClassName('day')[i]
            .innerText = date.toGermanDayShort(true);

        trElements[1]
            .getElementsByTagName('td')[i]
            .getElementsByTagName('img')[0]
            .src = 'icons/'+day.weather[0].icon+'.png';

        trElements[2]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('maxTemp')[0]
            .innerText = Math.round(day.temp.max) + '°';

        trElements[3]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('avgTemp')[0]
            .innerText = this.calcAvgTemp(day.temp) + '°';

        trElements[4]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('minTemp')[0]
            .innerText = Math.round(day.temp.min) + '°';

        trElements[5]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('feelTemp')[0]
            .innerText = this.calcAvgTemp(day.feels_like) + '°';

        trElements[6]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('rain')[0]
            .innerText = typeof day.rain === 'number' ? (day.rain + ' mm') : "N/A";

        trElements[7]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('snow')[0]
            .innerText = typeof day.snow === 'number' ? (day.snow + ' mm') : "N/A";
        
        trElements[8]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('uvIndex')[0]
            .innerText = day.uvi;

        trElements[9]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('wind')[0]
            .innerText = this.degreeToCompass(day.wind_deg) + " " +day.wind_speed + " m/s";

        trElements[10]
            .getElementsByTagName('td')[i]
            .getElementsByClassName('humidity')[0]
            .innerText = day.humidity + '%';
    }

    createDailyForecastChart(chartLabels, chartData){

        var chart = new Chart(this.ctx5daysForecast,{
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: chartData
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

    /**
     * @param {object} datasets 
     * @param {object} day 
     */
    collectDataForDailyForecastChart (datasets, day){

        datasets[0].data.push(day.temp.min);
        datasets[1].data.push(this.calcAvgTemp(day.temp));
        datasets[2].data.push(this.calcAvgTemp(day.feels_like));
        datasets[3].data.push(day.temp.max); 
    }

    calcAvgTemp(temp){
        return Math.round((temp.day + temp.morn + temp.eve + temp.night) / 4);
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
        let navUl = document.getElementById('navCities');
        let cityData, li, onTouchOrClick;
        let index = 0;
        let self = this;

        onTouchOrClick = function(){
            self.page = this.getAttribute('page');
            document.getElementById('selectedCity').removeAttribute('id');
            this.setAttribute('id', 'selectedCity');
            self.update(self);
        };

        for(const city of cache.cities){
            
            li = document.createElement('li');
            li.innerHTML = city.name;
            li.setAttribute('page', index);

            if(this.page == index)
                li.setAttribute('id', 'selectedCity');

            if(DEBUG)
                li.onclick = onTouchOrClick;
            else
                li.ontouchend = onTouchOrClick; // webview, so bind touch event

            navUl.appendChild(li);
            index++;
        }
    }

    chartOption_forecastDaily = [
        {
            label: 'Min',
            data: [],
            borderColor: 'darkblue',
            backgroundColor: '#00008b8c',
            borderWidth: 2,
            fill: true
        },
        {
            label: 'Avg',
            data: [],
            borderColor:'white',
            backgroundColor: '#f5f5f53d',
            borderWidth: 2,
            fill: true
        },
        {
            label: 'Gefühlt',
            data: [],
            borderColor: '#2aff2a',
            backgroundColor: "darkgreen",
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
        
            if(useToday && this.getDate() == new Date().getDate()){
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