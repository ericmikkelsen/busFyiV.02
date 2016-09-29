navigator.geolocation.getCurrentPosition(function(position) {

  path = window.location.pathname;

  if (path == '/') {
    d = document;
    console.log('/ is a thing');
    console.log(position.coords);

      input_lat = d.createElement('input');
      input_lat.value = position.coords.latitude;
      input_lat.name = 'latitude';
      input_lat.type = 'text';
      input_lat.style.display = 'none';

      //+','+position.coords.longitude+','+position.coords.accuracy
      input_lon = d.createElement('input');
      input_lon.value = position.coords.longitude;
      input_lon.name = 'longitude';
      input_lon.type = 'text';
      input_lon.style.display = 'none';

    f = d.getElementsByTagName('form')[0];
    //console.log(f);
    data_js = f.querySelector('.data-js');
    f.removeChild(data_js);

    //add long and lat data
        f.appendChild(input_lat);
    f.appendChild(input_lon);


  }

});
