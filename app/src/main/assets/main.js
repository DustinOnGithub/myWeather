/**
 * @var {object} settings
 */

 const DEBUG = cache.debug && !navigator.userAgent.includes ('wv');

if(!DEBUG){
  console.debug = function(){}
}

/*
call by coordinate,  neumarkt:
http://api.openweathermap.org/data/2.5/forecast?lat=49.283333&lon=11.466667&APPID=key&units=metric&noCache=kxouz

*/

let currentCity;

window.onload = function(){

  let dom = new Dom();
  let apiHandler = new ApiHandler();

  if(cache.apiKey){
    document.getElementById('apiKey').innerText = `${cache.apiKey.substr(0, 6)}...${cache.apiKey.substr(-6)}`;
  } else{
    document.getElementById('apiKey').innerText = "Kein API-Key hinterlegt!";
  }

  if("geolocation" in this.navigator) {
    let locationManager = new LocationManager();
    locationManager.addLocationEvent();
  }
  else{
    if(DEBUG) console.log("no geolocation!");
    else      Android.showToast("Standortzugriff ist nicht möglich!");
  }

  let request = apiHandler.oneCall(cache.cities[0]);

  //to complicated?
  function waitAndDisplay() {
    if(request.readyState != XMLHttpRequest.DONE){
      setTimeout(waitAndDisplay, 20);
    }else{
      dom.hideLoadingPage();
      dom.displayCities();
      dom.update();
      setInterval(() => {
        // todo: get current weather of 'current' city. 
        dom.update()
      }, 3000); //i can't pass the function by reference, otherwise 'this' is not accessible in the function itself
    }
  }
  
  waitAndDisplay();
}

//-------- kotlin -> js interface:
function setCoordinates(latitude, longitude){
  console.log("coordinate: " + latitude);
  document.getElementById('coordinates').innerText = "coordinates: " + latitude + " - " + longitude;
}