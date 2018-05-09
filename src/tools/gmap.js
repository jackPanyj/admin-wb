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
var roofIdToIndex = [];
var lastRoofId = 0;
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


function getHighlightIcon() {
  var image = {
      url: 'http://okua1wabz.bkt.clouddn.com/red_icon.png',
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
    MyDefineMenu(map);
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
            roofId: marker.id,
            url: window.location.origin + '/fe/act_detail/'+ marker.id
        });
        // 以下表示点击调整到第三页
        google.maps.event.addListener(_marker, 'click', function() {
          window.open(this.url);
        });
        _marker.addListener('mouseover', markMouseOver);
        _marker.addListener('mouseout', markMouseOut);

        current_markers.push(_marker);
        roofIdToIndex[marker.id] = current_markers.length - 1;


    });
}

      function markMouseOver() {
        if (lastRoofId > 0) {
            current_markers[roofIdToIndex[lastRoofId]].setIcon(getIcon());
        }
        lastRoofId = this.roofId;
        // TODO
        window.$map.highlightRoofId = lastRoofId;
        current_markers[roofIdToIndex[lastRoofId]].setIcon(getHighlightIcon());
      }

      function markMouseOut() {
        if (lastRoofId > 0) {
            // TODO
            window.$map.highlightRoofId = null;
            current_markers[roofIdToIndex[lastRoofId]].setIcon(getIcon());
            lastRoofId = 0;
        }
      }

      function highlightRoof(roofId) {
        if (lastRoofId > 0) {
            current_markers[roofIdToIndex[lastRoofId]].setIcon(getIcon());
        }
        lastRoofId = roofId;
        current_markers[roofIdToIndex[lastRoofId]].setIcon(getHighlightIcon());
      }

      function highlightNothing() {
        if (lastRoofId > 0) {
            current_markers[roofIdToIndex[lastRoofId]].setIcon(getIcon());
            lastRoofId = 0;
        }
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
      centerChangedDoNothing = true
      zoomChangedDoNothing = true
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
            clickable: false,
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
    roofIdToIndex = [];
    lastRoofId = 0;
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

function hasClass(target, name) {
  return target.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'));
}

function removeClass(target, name) {
  if (hasClass(target, name)) {
      target.className = target.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ');
  }
}

function addClass(target, name) {
  if (!hasClass(target, name)) {
      target.className += " " + name;
  }
}

function MenuControl(map) {
  this.container = document.createElement("div");
  this.coordinate = null;
  this.map = map;
  this.sender = null
  this.isEnable = true;
  this.container.className = "menu_casing";
  this.hide();
  this.items = new Array();
  var self = this;
  google.maps.event.addListener(map, "click", function() {
      self.hide();
  });
  google.maps.event.addListener(map, "movestart", function() {
      self.hide();
  });
  google.maps.event.addListener(map, "zoom_changed", function() {
      self.hide();
  });
  google.maps.event.addListener(map, "dragstart", function() {
      self.hide();
  });
  this.container.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.container);
}

MenuControl.prototype.show = function(groupName) {
  this.container.style.display = "block";
  if (groupName) {
      for (var i = 0; i < this.items.length; i++) {
          if (groupName == this.items[i].groupName) {
              this.items[i].show();
          } else {
              this.items[i].hide();
          }
      }
  }
}

MenuControl.prototype.hide = function(groupName) {
  this.container.style.display = "none";
  if (groupName) {
      for (var i = 0; i < this.items.length; i++) {
          if (groupName == this.items[i].groupName) {
              this.items[i].hide();
          } else {
              this.items[i].show();
          }
      }
  }
}

MenuControl.prototype.enable = function() {
  this.isEnable = true;
}

MenuControl.prototype.disable = function() {
  this.isEnable = false;
}

MenuControl.prototype.isHide = function() {
  return (this.container.style.display == "none");
}

MenuControl.prototype.addItem = function(item) {
  item.host = this;
  this.items.push(item);
  this.container.appendChild(item.casing);
}

MenuControl.prototype.addSeparator = function(group) {
  var separator = group || new MenuSeparator();
  if (typeof group == "string") {
      separator = new MenuSeparator(group);
  }
  this.items.push(separator);
  this.container.appendChild(separator.casing);
}


function MenuSeparator(groupName) {
  this.groupName = groupName;
  this.casing = document.createElement("div");
  this.casing.className = "menu_separator";
}

MenuSeparator.prototype.show = function() {
  this.casing.style.display = "block";
}

MenuSeparator.prototype.hide = function() {
  this.casing.style.display = "none";
}

function MenuItem(options) {
  options = options || {};
  this.text = options.text || "";
  this.icon = options.icon;
  this.handler = options.handler;
  this.groupName = options.groupName;
  this.host = null;

  this.casing = document.createElement("div");
  this.casing.className = "menu_item";

  var menu_text = document.createElement("div");
  menu_text.className = "menu_text";
  var text_lable = document.createElement("span");
  text_lable.innerHTML = this.text;
  menu_text.appendChild(text_lable);
  this.casing.appendChild(menu_text);

  var self = this;
  if (this.icon) {
      var item_icon = document.createElement("div");
      item_icon.className = "menu_icon";
      item_icon.style.backgroundImage = "url(" + self.icon + ")";
      self.casing.appendChild(item_icon);
  }

  if (typeof self.handler == "function") {
      google.maps.event.addDomListener(self.casing, "click", function() {
          if (self.host) {
              self.handler(self.host.coordinate);
              self.host.hide();
          }
      });
  }
  google.maps.event.addDomListener(self.casing, "mouseover", function() {
      addClass(self.casing, "item_active");
  });

  google.maps.event.addDomListener(self.casing, "mouseout", function() {
      removeClass(self.casing, "item_active");
  });
}

MenuItem.prototype.show = function() {
  this.casing.style.display = "block";
}

MenuItem.prototype.hide = function() {
  this.casing.style.display = "none";
}


// ------

/**
* 自定义 menu 菜单
* @return { none }  无
*/

const MyDefineMenu = (map) => {
 // 构建右键菜单对象
 var menu = new MenuControl(map);
 menu.sender = map;

 // 监听 map 的右键点击事件
 google.maps.event.addListener(map, "rightclick", (e) => {

     var mapZoom = map.getZoom();
     if (mapZoom < 11) {
         menu.isEnable = false;
     } else {
         menu.isEnable = true;
     }

     if (menu.isEnable) {
         menu.coordinate = {
             point: e.pixel,
             latlng: e.latLng
         };
         menu.container.style.left = e.pixel.x + "px";
         menu.container.style.top = e.pixel.y + "px";
         menu.show("map");
     }
 });

 // 添加 marker 标记
 menu.addItem(new MenuItem({
     text: "添加标记",
     icon: "http://okua1wabz.bkt.clouddn.com/marker_1_s.png",
     groupName: "map",
     handler: function(coor) {

         // TODO get distance, use lat, lon, distance
         var lat = coor.latlng.lat();
         var lon = coor.latlng.lng();
         var p_distance = window.$map.distance * 1000
         window.$map.getWithDistance({lat, lon, distance: p_distance})
         centerCurrent(coor.latlng, p_distance)


         // 添加标记的右键点击事件，弹出菜单时，IE 以外的浏览器会出现偏移
         var rightclick = function(e) {
             // menu.sender = sMarker;
             if (menu.isEnable) {
                 var x = e.pixel.x;
                 var y = e.pixel.y;

                 if (document.all) {
                     x = window.event.x;
                     y = window.event.y;
                 } else {
                     // 在 IE 以外的浏览器使用鼠标的 x 和 y 坐标弹出菜单时会出现偏移，需要另外计算
                     var eve = window.event;
                     if (!eve) {
                         var c = rightclick;
                         do {
                             var arg0 = c.arguments[0];
                             if (arg0) {
                                 if (arg0.constructor == MouseEvent) {
                                     eve = arg0;
                                     break;
                                 }
                             }
                             c = c.caller;
                         } while (c.caller)
                     }
                     var scale = Math.pow(2, map.getZoom());
                     var bounds = map.getBounds();
                     var nw = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
                     var point = map.getProjection().fromLatLngToPoint(nw);
                     var worldCoor = map.getProjection().fromLatLngToPoint(coor.latlng);
                     var off = new google.maps.Point(Math.floor((worldCoor.x - point.x) * scale), Math.floor((worldCoor.y - point.y) * scale));
                     var markerImg = eve.target.parentNode.parentNode.childNodes[0];
                     x = (off.x - (markerImg.offsetWidth) / 2) + eve.layerX;
                     y = (off.y - markerImg.offsetHeight) + eve.layerY;
                 }

                 menu.coordinate = {
                     point: new google.maps.Point(x, y),
                     latlng: coor.latlng
                 };
                 menu.container.style.left = x + "px";
                 menu.container.style.top = y + "px";
                //  <!--menu.show("sMarker");-->
             }
         }
     }
 }));
}

function centerCurrent(location, distance) {
    map.setCenter(location);
    centerChangedDoNothing = true;
    zoomChangedDoNothing = true;
    cleanLocateInfo();
    location_marker = new google.maps.Marker({
      map: map,
      position: location,
      icon: getIcon()
    });
    location_circle = new google.maps.Circle({
        center: location,
        draggable: false,
        editable: false,
        clickable: false,
        fillColor: '#09f',
        fillOpacity: .1,
        radius: distance,
        strokeColor: '#09f',
        strokeWeight: 1,
        strokeOpacity: 1,
        map: map
    });
  }


export {initMap, geocodeAddress, clickZone, addMarkers, highlightRoof, highlightNothing}