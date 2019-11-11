const CURRENT_UPDATE_INTERVAL = 600000; // 10 minutes, recommend

class ApiHandler{

    constructor(){
        let i = 0;
      
        this.key = settings.key;
        /** @member {Array} cities */
        this.cities = settings.cities;
        this.cache = [];

        for(; i < this.cities.length; i++){
            
            this.cache.push(
                {
                    city: this.cities[i],
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

                xHttp.onreadystatechange = function() {
                    let k;
                    if (this.readyState == 4){  
                      switch(this.status) {
                        case 200:

                            let response = JSON.parse(this.response);

                            console.debug(response);

                            //get the right cache and update:
                            for(k = 0; k < self.cache.length; k++){
                                if(self.cache[k].city == response.id){
                                    self.cache[k].current.lastUpdate = response.dt * 1000;
                                    self.cache[k].current.data = response;
                                    console.debug("updated current weather cache for city '" + self.cache[k].current.data.name + "'!");
                                    success = true;
                                }
                            }

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

                xHttp.open(
                    "GET", 
                    "http://api.openweathermap.org/data/2.5/weather?APPID="+settings.apiKey+"&id="+ self.cities[i] +"&units=metric" + XMLHttpRequest.noCacheStr(), 
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
}