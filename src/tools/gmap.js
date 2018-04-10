/* eslint-disabled */
var zoneMap = {};
var provinceList = [];
var cityList = [];
var districtList = [];
var zoomChangedDoNothing = false;
var centerChangedDoNothing = false;

var current_circles = [];
var current_txts = [];
var location_circle = null;
var location_marker = null;
var current_markers = [];
var map = null;
var geocoder = null;

function getIcon() {
  var image = {
      url: 'http://okua1wabz.bkt.clouddn.com/location2.png',
      scaledSize: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 10)
  };
  return image;
}

  function initMap(map_id, zoneData) {
    if (zoneData) {
        initZoneData(zoneData);
    }
    else {
        initZoneData(all_zones);
    }

    var latlng = new google.maps.LatLng(30.9022295994, 117.2460859801);
    var myOptions = {
        backgroundColor: '#eee',
        center: latlng,
        draggable: true,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        keyboardShortcuts: false,
        mapTypeControl: false,
        mapTypeId: 'hybrid',
        maxZoom: 18,
        minZoom: 5,
        rotateControl: false,
        scaleControl: false,
        streetViewControl: false,
        zoom: 5,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };
    map = new google.maps.Map(document.getElementById(map_id), myOptions);
    displayCircles(provinceList)
    geocoder = new google.maps.Geocoder();
    map.addListener('zoom_changed', zoomChangedListener);
    map.addListener('center_changed', centerChangedListener);
  }


  function addMarkers(markers, offset, order_by){
    if (offset == 0) {
        cleanMarkers();
    }

    markers.forEach(function(marker) {
        var _marker = new google.maps.Marker({
            map: map,
            title: marker.owner,
            position: new google.maps.LatLng(marker.lat, marker.lon),
            icon: getIcon(),
            url: window.location.origin + '/fe/act_detail/'+ marker.id
        });
        // 以下表示点击调整到第三页
        google.maps.event.addListener(_marker, 'click', function() {
          window.open(this.url);
        });
        current_markers.push(_marker);
    });
}

  function clickZone(zone_id) {
    var level = zoneMap[zone_id].level;
    var center = zoneMap[zone_id].center;
    cleanLocateInfo();
    map.setCenter(center);

    if (level == 1) {
      map.setZoom(7);
      displayCircles(cityList);
    }
    else if (level == 2) {
      map.setZoom(10);
      displayCircles(districtList);
    }
    else {
      map.setZoom(13);
      window.$map.handleChange(['gmap', zone_id])
      //  TODO display roof by zone_id
    }
}



function geocodeAddress(address, distance, cb) {
    geocoder.geocode({'address': address, 'region': 'CN'}, function(results, status) {
      if (status === 'OK') {
        map.setCenter(results[0].geometry.location);
        centerChangedDoNothing = true;
        zoomChangedDoNothing = true;
        map.setZoom(13);
        cleanLocateInfo();
        location_marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: getIcon()
        });
        location_circle = new google.maps.Circle({
            center: results[0].geometry.location,
            draggable: false,
            editable: false,
            fillColor: '#09f',
            fillOpacity: .1,
            radius: distance,
            strokeColor: '#09f',
            strokeWeight: 1,
            strokeOpacity: 1,
            map: map
        });
        cb({"lon": results[0].geometry.location.lng(), "lat": results[0].geometry.location.lat()})
      } else {
        cb(null)
      }
    });
  }


function initZoneData(zones) {
  var changed_zones = [];
  for (var index in zones) {
      var zone = zones[index];
      zone['center'] = {'lat': zone.lat, 'lng': zone.lon};
      changed_zones.push(zone);
  }
  for (var index in changed_zones) {
    var zone = changed_zones[index];
    zoneMap[zone.id] = zone;
    if (zone.count > 0){
        if (zone.level == 1) {
            provinceList.push(zone);
        } else if (zone.level == 2) {
            cityList.push(zone);
        } else if (zone.level == 3) {
            districtList.push(zone);
        } else {}
    }
  }
}

  function centerChangedListener(){
    window.setTimeout(function() {
      if (centerChangedDoNothing == true) {
        centerChangedDoNothing = false;
        return null;
      }
      var center = map.getCenter();
      var zoom = map.getZoom();
      if (zoom <= 11) {
          cleanLocateInfo();
          cleanMarkers();
      } else {
          refreshRoofList();
      }
    }, 500);
  }

  function zoomChangedListener(){
    window.setTimeout(function() {
      var zoom = map.getZoom();
      if (zoom <= 11) {
          cleanLocateInfo();
          cleanMarkers();
          // TODO clear roofs
      }
      if (zoom <= 6) {
          displayCircles(provinceList);
      } else if (zoom <= 9) {
          displayCircles(cityList);
      } else if (zoom <= 11) {
          displayCircles(districtList);
      } else {
          displayCircles([]);
          if (zoomChangedDoNothing == true) {
            zoomChangedDoNothing = false;
            return null;
          }
          refreshRoofList();
      }
    }, 500);
  }

  function displayCircles(zones) {
    if (current_circles.length == zones.length) {
        return;
    }
    current_circles.forEach(function(circle) {
       circle.setMap(null);
    });
    current_circles = [];
    current_txts.forEach(function(current_txt) {
       current_txt.setMap(null);
    });
    current_txts = [];

    var radius = 10000;
    zones.forEach(function(zone) {
       if (zone.count == 0) {
           return;
       }
       if (zone.level == 1) {
          radius = 140000;
       }
       else if (zone.level == 2) {
          radius = 30000;
       }
       else if (zone.level == 3) {
          radius = 6000;
       } else {}

       var cityCircle = new google.maps.Circle({
         center: zone.center,
         draggable: false,
         editable: false,
         fillColor: '#09f',
         fillOpacity: 0.6,
         radius: radius,
         strokeColor: '#09f',
         strokeWeight: 1,
         strokeOpacity: 1,
         map: map
       });

       cityCircle.addListener('click', function() {
           clickZone(zone.id);
       });
       current_circles.push(cityCircle);

       var customTxt = "<div><font color='white'>" + zone.name + "</font><br><font color='white'>" +  zone.count + "</font></div>";
       var latlng = new google.maps.LatLng(zone.center.lat, zone.center.lng);
       var txt = new TxtOverlay(latlng, customTxt, "customBox", map);
       current_txts.push(txt);
     });
 }
var tim = Date.now()
var $timer_id;
function refreshRoofList() {
    var center = map.getCenter();
    var lat = center.lat();
    var lon = center.lng();
    var northEast = map.getBounds().getNorthEast();
    var distance = getDistanceFromLatLon(lat, lon, lat, northEast.lng());
    if (Date.now() - tim < 1000) {
      clearTimeout($timer_id)
    }
    tim = Date.now()
    $timer_id = setTimeout(function () {
      window.$map.getWithDistance({lat, lon, distance})
    }, 1000)
}

function cleanLocateInfo(){
    if (location_marker != null) {
            location_marker.setMap(null);
            location_circle.setMap(null);
    }
}

function cleanMarkers(){
    current_markers.forEach(function(marker) {
      marker.setMap(null);
    });
    current_markers = [];
}

function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 1000;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



    function TxtOverlay(pos, txt, cls, map) {

  this.pos = pos;
  this.txt_ = txt;
  this.cls_ = cls;
  this.map_ = map;

  this.div_ = null;
  this.setMap(map);
}

TxtOverlay.prototype = new google.maps.OverlayView();


TxtOverlay.prototype.onAdd = function() {

  var div = document.createElement('DIV');
  div.className = this.cls_;
  div.innerHTML = this.txt_;

  // Set the overlay's div_ property to this DIV
  this.div_ = div;
  var overlayProjection = this.getProjection();
  var position = overlayProjection.fromLatLngToDivPixel(this.pos);
  div.style.left = position.x  + 'px';
  div.style.top = position.y  + 'px';
  // We add an overlay to a map via one of the map's panes.
  var panes = this.getPanes();
  panes.floatPane.appendChild(div);
}
TxtOverlay.prototype.draw = function() {


    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);


    var div = this.div_;
    div.style.left = (position.x-12) + 'px';
    div.style.top = (position.y-12) + 'px';



  }
  //Optional: helper methods for removing and toggling the text overlay.
TxtOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
}
TxtOverlay.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.visibility = "hidden";
  }
}

TxtOverlay.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = "visible";
  }
}

TxtOverlay.prototype.toggle = function() {
  if (this.div_) {
    if (this.div_.style.visibility == "hidden") {
      this.show();
    } else {
      this.hide();
    }
  }
}

TxtOverlay.prototype.toggleDOM = function() {
  if (this.getMap()) {
    this.setMap(null);
  } else {
    this.setMap(this.map_);
  }
}

export {initMap, geocodeAddress, clickZone, addMarkers}