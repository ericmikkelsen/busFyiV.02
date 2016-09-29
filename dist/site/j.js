//BF = bus.fyi

BF_Check = function(){

  this.lazyload = function(s){
    var d = window.document;
           b = d.body; /* appends at end of body, but you could use other methods to put where you want */
           e = d.createElement("script");

       e.async = true;
       e.src = s;
       b.appendChild(e);
  }

  features = [
    [navigator.geolocation, 'j/geolocation.js'],
  ]

  for (var i = 0; i < features.length; i++) {
    if (features[i][0] !== undefined) {
      this.lazyload(features[i][1]);
    }//if
  }//for

}
//bf_check = new BF_Check();
