const CURRENT_UPDATE_INTERVAL = 600000; // 10 minutes, recommend

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
                    forecast: {
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
                    > CURRENT_UPDATE_INTERVAL
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

    getForecastWeather() {
        let i = 0, xHttp, self = this, success = false, response;

        if(!this.cache[i].forecast.lastUpdate || 
            ((new Date().getTime() - this.cache[i].forecast.lastUpdate) 
                > CURRENT_UPDATE_INTERVAL
            )
        ){
            for(; i < this.cities.length; i++){
                xHttp = new XMLHttpRequest();

                xHttp.onload = function () {
                    
                    if(response = self.handleResponse(this)){
                        if(self.cache[i].city == response.city.id){
                            self.cache[i].forecast.lastUpdate = new Date().getTime();
                            self.cache[i].forecast.data = response;
                            console.debug("updated forecast weather cache for city '" + self.cache[i].current.data.name + "'!");
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
            console.debug("forecast weather for city '" + this.cache[i].current.data.name + "' already cached!");
        }

        return success;
    }

    getForecastForCity(cityId){
        let k;
        this.getForecastWeather();

        for(k = 0; k < this.cache.length; k++){
            if(this.cache[k].city == cityId){
                return this.cache[k].forecast.data;
            }
        }
        return false;
    }

    handleResponse(xHttp){
        //todo: alert is not working in the webView
        switch(xHttp.status) {
            case 200:

                let response = JSON.parse(xHttp.response);
                console.debug(response);
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