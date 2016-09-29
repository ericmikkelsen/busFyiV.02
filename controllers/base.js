var   express = require('express'),
      app = express(),
      fs = require('fs'),
      bodyParser = require('body-parser'),
      jsonfile = require('jsonfile'),
      nj = require('nunjucks'),
      parseString = require('xml2js').parseString,
      path = require("path"),
      request = require('request');

var Live = function(){

  this.agencies = {

    chicago_transit_authority: {
      urls:{
        bus:{
          key: '?key='+'ah9z9VMRp4VSwKW9gwSHeCPaM',
          address:'http://www.ctabustracker.com/bustime/api/v1/',
          getPredictions: function(stpid){
            return this.address+'getpredictions'+this.key+'&stpid='+stpid;
          },//getPredictions

        },//bus
        train:{
          key: '?key='+'c0ee0d838f4846f2bd291a01c2b9bb82',
          address:'http://lapi.transitchicago.com/api/1.0/',
          getPredictions: function(stpid){
            return this.address+'/ttarrivals.aspx'+this.key+''+stpid;
          },//getPredictions
        }//train

      },//urls

      getPredictions: function( stpid, location_type, write,end){
        /* location_type
            0 means bus
            1 means train */



      }//getPredictions

    },//chicago-transit-authority,


  }//agencies
}//Live

var Routes = function () {

//between comes in usefule later
Number.prototype.between = function (min, max) {
    return this > min && this < max;
};

keys = {
  google_maps: 'AIzaSyDhbbBgorLkN8w-9IrWJSa1Vn6pHC_BgxI',
}
var folders = {
        data:'../dist/data/chicago-transit-authority',
        site:'../dist/site',
      },
      gtfs_data = {
        stops: JSON.parse(fs.readFileSync(folders.data+'/stops.json', 'utf8')),
        routes: JSON.parse(fs.readFileSync(folders.data+'/routes.json', 'utf8')),
      };

      app.use(bodyParser.urlencoded());
      app.use(bodyParser.json());


    //set views directory
    nj.configure('../views', { autoescape: true });

    //ERIC REPLACE USES OF THIS WITH FILTER
      function between(x, min, max) {
        return x >= min && x <= max;
      }

    this.views = {

      head: function(context){
        //should at least have title in there
        return nj.render('head.html',context);
      },
      footer:function(context){
        return nj.render('footer.html',context);
      },
      base__get: function(listen,bdy,data){

          head = this.head,
          footer = this.footer
          app.get(listen,function(req,res){
            write = function(str){res.write(str)};

            end = function(){
              write(footer(data));
              res.end();
              }

            write(head(data));
            bdy(res,req,write,data,end);
          });
      },
      base__post: function(listen,bdy,data){
          head = this.head,
          footer = this.footer
          app.post(listen,function(req,res){
            write = function(str){res.write(str)};

            end = function(){
              write(footer(data));
              res.end();
              }

            write(head(data));
            bdy(res,req,write,data,end);

          });//app.post

      },
    stops: function(listen){

        stops__body = function(res,req,write,data,callback){
          write('<h1 class="u-fw">Nearby Stops</h1>');
          address=req.body.address; //i am accessign req object body for username
          zip=req.body.zip;

          console.log(req.body);

          if (typeof req.body.address !== undefined && req.body.latitude == undefined){

          request({url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address +',+' + zip + '&key=' + keys.google_maps}, function (error, response, body) {
            write('<ul class="list--unstyled list--striped">');
           //turn json into parseable data
             JSON_body = JSON.parse(body, 'utf8');
             location = JSON_body.results[0].geometry.location;
             console.log('test');

             //break this out into it's only thing
             for (var i = 0; i < gtfs_data.stops.length; i++) {
               //ERIC TURN THIS IF STATMENT INTO FILTER.
               if (between(gtfs_data.stops[i].stop_lon,location.lng - .003, location.lng + .003)&&between(gtfs_data.stops[i].stop_lat,location.lat - .003, location.lat + .003)) {
                //console.log(gtfs_data.stops[i]);
                //u = url
                //t = text
                //l = link
                //d = description
                u = 'stp?id='+gtfs_data.stops[i].stop_id+'&name='+encodeURIComponent(gtfs_data.stops[i].stop_name);
                t = gtfs_data.stops[i].stop_name;
                d = gtfs_data.stops[i].stop_desc.replace(gtfs_data.stops[i].stop_name+', ', '');

                stop_data = {
                  url: u,
                  heading: t,
                  kicker: d,
                }
                  //write(nj.render('atm-btn.html', btn_data) );
                  write(nj.render('mdl_li.html',stop_data));

               }//if between

             }//for
             //this is almost always
             write('</ul>');
             callback();
           });//request

        /*end if address exists*/
        }else if(typeof req.body.longitude !== undefined && typeof req.body.latitude !== undefined){

          write('<ul class="list--unstyled list--striped">');
          //break this out into it's only thing
          for (var i = 0; i < gtfs_data.stops.length; i++) {
            //ERIC TURN THIS IF STATMENT INTO FILTER.
            lng = parseFloat(req.body.longitude);
            lat = parseFloat(req.body.latitude);
            console.log(lng+'/'+lat);

            if (between(gtfs_data.stops[i].stop_lon, lng - .003, lng + .003)&&between(gtfs_data.stops[i].stop_lat,lat - .003, lat + .003)) {
             console.log(gtfs_data.stops[i]);
               u = 'stp?id='+gtfs_data.stops[i].stop_id+'&name='+encodeURIComponent(gtfs_data.stops[i].stop_name);
               t = gtfs_data.stops[i].stop_name;
               d = gtfs_data.stops[i].stop_desc.replace(gtfs_data.stops[i].stop_name+', ', '');
               stop_data = {
                 url: u,
                 heading: t,
                 kicker: d,
               }
              write(nj.render('mdl_li.html',stop_data));

            }//if between

          }//for
          write('</ul>');
          //this is almost always
          callback();



        }/*end if long & lat exists*/

          }
        this.base__post(listen,stops__body,{});
    },//views.stops
    stp: function(listen){

      stp__body = function(res,req,write,data,callback){

        write('<h1 class="u-fw">'+req.query.name+'</h1>');


        ///write('<h2>Scheduled Arrival Times</h2>');

        //Scheduled TIMES holding til I can figure out how to do this

        stop_json = folders.data+'/stops/'+req.query.id+'.json';
        stop_json= fs.readFileSync(stop_json, 'utf8');
        stop_json = JSON.parse(stop_json,'utf8');

        //ERIC MAKE THIS REUSABLE AT SOMEPOINT IN LIFE
        //LIVE DATA
        urls = {
          bus:{
            key: '?key='+'ah9z9VMRp4VSwKW9gwSHeCPaM',
            address: 'http://www.ctabustracker.com/bustime/api/v1/',
            getPredictions: function(stpid){
              return this.address+'getpredictions'+this.key+'&stpid='+stpid;
            },//getPredictions

          },//bus
          train:{
            key: '?key='+'c0ee0d838f4846f2bd291a01c2b9bb82',
            address:'http://lapi.transitchicago.com/api/1.0/',
            getPredictions: function(stpid){
              return this.address+'/ttarrivals.aspx'+this.key+'&stpid='+stpid;
            },//getPredictions
          }//train

        };//urls
        //console.log(stop_json.arrivals[0]);
        stop_type = stop_json.arrivals[0].route_type;
        if (stop_json.arrivals[0] !== null) {



        if(stop_type == 3){

          url = urls.bus.getPredictions(stop_json.details.stop_id);

          request( {url: url},function(error, response, body){

            parseString(body, function (err, result) {



                predictions = result['bustime-response'].prd;
                if (predictions!= undefined|null) {
                  write('<h2 class="u-fw">Live Arrival Times</h2>');
                  write('<ul class="list--unstyled list--striped">');

                for (var i = 0; i < predictions.length; i++) {

                  arrival = predictions[i].prdtm.toString();
                  arrival = arrival.split(" ");
                  arrival = arrival[1].split(":");

                  if(parseInt(arrival[0])>12){
                    arrival[0] = arrival[0]-12;
                  }

                  getRt = function(obj){
                    if (obj.route_id == predictions[i].rt){
                      return true;
                    } else {
                      return false;
                    }
                  }


                  rt_name = gtfs_data.routes.filter(getRt);
                  rt_name = rt_name[0].route_long_name;
                  //t = time
                  //r = route_data
                  stop_data = {
                    heading: arrival[0]+':'+arrival[1],
                    kicker: predictions[i].rt+' '+rt_name,
                  }

                  write(nj.render('mdl_li.html',stop_data));

                  //write('<p class="u-fw">#'+predictions[i].rt+' '+rt_name+' - '+arrival[0]+':'+arrival[1]+'</p>');

                }//for
                write('</ul>');
              }else{
                write('<p class="u-fw">There are no bus arrivals any time soon</p>');
              }//if predictions is greather than 0
              end();

            });//parseString
          });//request
          //write('</ul>')
        }else if(stop_type == 1){


          url = urls.train.getPredictions(stop_json.details.stop_id);
          request( {url: url},function(error, response, body){
            parseString(body, function (err, result) {

              write('<h2 class="u-fw">Live Arrival Times</h2>');
              if (result) {
                  for (var i = 0; i < result.ctatt.eta.length; i++) {

                    arrival = result.ctatt.eta[i].arrT.toString();
                    arrival = arrival.split(" ");
                    arrival = arrival[1].split(":");
                    if(parseInt(arrival[0])>12){
                      arrival[0] = arrival[0]-12;
                    }
                    write('<p class="u-fw">'+  result.ctatt.eta[i].rt+' '+result.ctatt.eta[i].destNm+' - '+arrival[0]+':'+arrival[1]+'</p>');

                  }
              }else{
                  write('<p class="u-fw">There are no train arrivals any time soon</p>');
              }
              end();
            });
          });


        }else{
          write('</br>not working</br>');
        }//
      }else{
        write('<p>There are no arrivals any time soon</p>');
        end();
      }//if (top_json.arrivals[0]) {

      }//stp__body
      this.base__get(listen,stp__body,{});
    }
  }//views


  //turn on express, listen to port 3000
    app.listen(8080, function () {console.log('Example app listening on port 8080!');});
  //watch the static folders directory for requests
    app.use(express.static(folders.site));
  //listen for stops requests
    this.views.stops('/stops');
  //stp page
    this.views.stp('/stp');
}
r = new Routes();
