
class ApiHandler{

    constructor(){
        XMLHttpRequest.noCacheStr = function(){
            return '&noCache=' + Math.random().toString(36).substring(7);
        };
    }

    checkResponse(xHttp){
        //todo: alert is not working in the webView
        switch(xHttp.status) {
            case 200:
                try{
                    return JSON.parse(xHttp.response);
                } catch(e){}
                break;
            case 401:
                alert("unauthorized! probably api-key is invalid");
                break;
            case 429:
                alert('to many requests to openWeatherMap.org! Try it later...');
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

    /**
     * 
     * @param {object} city
     * @returns XMLHttpRequest 
     */
    oneCall(city){

        let checkResponse = this.checkResponse;
        let xHttp = new XMLHttpRequest();

        xHttp.onload = function() {
            let response = checkResponse(this);
            if(response){
                city.current = response.current;
                city.hourly = response.hourly;
                city.daily = response.daily;

                city.current.dt *= 1000;

                console.debug(cache);
            }
            else{
                console.debug("api request failed! no daily forecast weather!");
            }
        };

        xHttp.open(
            "GET",
            "https://api.openweathermap.org/data/2.5/onecall?"
            +`lat=${city.coordinates[0]}`
            +`&lon=${city.coordinates[1]}`
            +"&exclude=minutely"
            +`&appid=${cache.apiKey}`
            +`&units=metric`
            +'&lang=de'
        );
        xHttp.send();

        return xHttp;
    }

    
}