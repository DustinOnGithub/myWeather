/**
 * @var {object} settings
 */

const DEBUG = cache.debug && !navigator.userAgent.includes ('wv');

if(!DEBUG){
  console.debug = function(){}
}

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

  dom.update();
}

//-------- kotlin -> js interface:
function setCoordinates(latitude, longitude){
  console.log("coordinate: " + latitude);
  document.getElementById('coordinates').innerText = "coordinates: " + latitude + " - " + longitude;
}