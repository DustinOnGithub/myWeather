class LocationManager{

  location = {
    time: false,
    coords: {}
  }

  geoLocationTasks = { isRunning: 0 }; // have to be a object to pass-by-reference

  addLocationEvent(){

    let postionOptions = {
      enableHighAccuracy: true,
      timeout: 5000 // ms
    }

    let glt = this.geoLocationTasks;

    document.getElementById('addLocation').ontouchend = () => {

      if(glt.isRunning) return;
      glt.isRunning = true;

      console.debug('addLocationEvent');
 
      navigator.geolocation.getCurrentPosition(
        function success (pos) {
          location.time = pos.timestamp;
          location.coords = pos.coords;

          glt.isRunning = false;

          if(DEBUG) console.debug("location: lat: " + location.coords.latitude + " long: " + location.coords.longitude);
          else      Android.showToast("lat: " + location.coords.latitude + " long: " + location.coords.longitude);
        },
        function error (err){
          let message;
          switch(err.code){
            case GeolocationPositionError.PERMISSION_DENIED:
              message = "Keine Berechtigung zur Ortung!";
              break;
            case GeolocationPositionError.POSITION_UNAVAILABLE:
              message = "Ortung nicht möglich!";
              break;
            case GeolocationPositionError.TIMEOUT:
              message = "Timeout bei Ortung";
              break;
          }

          glt.isRunning = false;
          
          if(DEBUG) console.debug("location error: " + message);
          else      Android.showToast(message); //todo: vibrate the phone
        },
        postionOptions
      );
    };
  }
}