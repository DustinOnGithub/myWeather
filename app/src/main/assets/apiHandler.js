const UPDATE_INTERVAL = 600000; // 10 minutes, recommend

class ApiHandler{

    constructor(){
        let i = 0;
      
        this.key = settings.key;
        /** @member {Array} cities */
        this.cities = settings.cities;
        this.cache = [];

        for(; i < settings.cities.length; i++){
            
            this.cache.push(
                {
                    city: settings.cities[i],
                    current: {
                        lastUpdate: false,
                        data: {}
                    },
                    forecastHourly: {
                        lastUpdate: false,
                        data: {}
                    },
                    forecastDaily: {
                        lastUpdate: false,
                        data: {}
                    }
                }
            )
        }
    }

    getCurrentForCity(cityId){
        let k;
        this.getCurrentWeather();

        for(k = 0; k < this.cache.length; k++){
            if(this.cache[k].city == cityId){
                return this.cache[k].current.data;
            }
        }
        return false;
    }

    getCurrentWeather(){
        let i = 0, xHttp, self = this, success = false;

        for(; i < this.cities.length; i++){
            
            if(!this.cache[i].current.lastUpdate || 
                ((new Date().getTime() - new Date(this.cache[i].current.lastUpdate).getTime()) 
                    > UPDATE_INTERVAL
                )
            ){
                xHttp = new XMLHttpRequest();

                xHttp.onload = function() {
                    let response;
                    if(response = self.handleResponse(this)){
                        if(self.cache[i].city == response.id){
                            self.cache[i].current.lastUpdate = response.dt * 1000;
                            self.cache[i].current.data = response;
                            console.debug("updated current weather cache for city '" + self.cache[i].current.data.name + "'!");
                            success = true;
                        }
                    }
                    else{
                        console.debug("api request failed! no current weather!");
                    }
                };

                xHttp.open(
                    "GET", 
                    "http://api.openweathermap.org/data/2.5/weather?APPID="+settings.apiKey+"&id="+ settings.cities[i] +"&units=metric" + XMLHttpRequest.noCacheStr(), 
                    false //no async!
                );
                xHttp.send();
            }
            else{
                console.debug("current weather for city '" + this.cache[i].current.data.name + "' already cached!");
            }
        }
        return success;
    }

    getHourlyForecastWeather() {
        let i = 0, xHttp, self = this, success = false, response;

        if(!this.cache[i].forecastHourly.lastUpdate || 
            ((new Date().getTime() - this.cache[i].forecastHourly.lastUpdate) 
                > UPDATE_INTERVAL
            )
        ){
            for(; i < this.cities.length; i++){
                xHttp = new XMLHttpRequest();

                xHttp.onload = function () {
                    
                    if(response = self.handleResponse(this)){
                        if(self.cache[i].city == response.city.id){
                            self.cache[i].forecastHourly.lastUpdate = new Date().getTime();
                            self.cache[i].forecastHourly.data = response;
                            console.debug("updated hourly forecast weather cache for city '" + self.cache[i].current.data.name + "'!");
                            success = true;
                        }
                    }
                };
                
                xHttp.open(
                    "GET",
                    "http://api.openweathermap.org/data/2.5/forecast?APPID="+ settings.apiKey +"&id="+settings.cities[i] +"&units=metric" + XMLHttpRequest.noCacheStr(),
                    false //no asy                
                );
                xHttp.send();
            }
        }
        else{
            console.debug("hourly forecast weather for city '" + this.cache[i].current.data.name + "' already cached!");
        }

        return success;
    }

    getDailyForecast(){
        let i = 0, xHttp, self = this, success = false;

        for(; i < this.cities.length; i++){
            
            if(!this.cache[i].forecastDaily.lastUpdate || 
                ((new Date().getTime() - new Date(this.cache[i].forecastDaily.lastUpdate).getTime()) 
                    > UPDATE_INTERVAL
                )
            ){
                xHttp = new XMLHttpRequest();

                xHttp.onload = function() {
                    let response;
                    console.log(response);
                    if(response = self.handleResponse(this)){
                        if(self.cache[i].city == response.id){
                            self.cache[i].forecastDaily.lastUpdate = response.dt * 1000;
                            self.cache[i].forecastDaily.data = response;
                            console.debug("updated daily forecast weather cache for city '" + self.cache[i].current.data.name + "'!");
                            success = true;
                        }
                    }
                    else{
                        console.debug("api request failed! no daily forecast weather!");
                    }
                };

                xHttp.open(
                    "GET", 
                    "http://api.openweathermap.org/data/2.5/forecast/onecall?"
                        +"APPID="+settings.apiKey
                        +"&id="+ settings.cities[i] 
                        +"&units=metric"
                        +"&exclude=hourly,current,minutely"
                        + XMLHttpRequest.noCacheStr(), 
                    false //no async!
                );
                xHttp.send();
            }
            else{
                console.debug("daily forecast weather for city '" + this.cache[i].current.data.name + "' already cached!");
            }
        }
        return success;
    }

getDailyForecastForCity(cityId){
        let k;  
        this.getDailyForecast();

        for(k = 0; k < this.cache.length; k++){
            if(this.cache[k].city == cityId){
                return this.cache[k].forecastDaily.data;
            }
        }
        return false;
    }

    getHourlyForecastForCity(cityId){
        let k;
        this.getHourlyForecastWeather();

        for(k = 0; k < this.cache.length; k++){
            if(this.cache[k].city == cityId){
                return this.cache[k].forecastHourly.data;
            }
        }
        return false;
    }

    handleResponse(xHttp){
        //todo: alert is not working in the webView
        switch(xHttp.status) {
            case 200:

                let response = JSON.parse(xHttp.response);
                return response;

            case 401:
                alert("unauthorized! probably api-key is invalid");
                break;
            case 429:
                alert('to many requests to open weather! Try it later...');
                break;
            case 500:
                alert("Server error! Try it later...");
                break;
            default:
                alert('unhandled http code ' + xHttp.status);
                break;
        }
        return false;
    }
}