/*
iRemote for XBMC
Copyright 2010 Furya-creations.net

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
  Class manipulation
  http://www.openjs.com/scripts/dom/class_manipulation.php
*/
function hasClass(ele,cls) {
  return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
  if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    ele.className=ele.className.replace(reg,' ');
  }
}

/*
  Cookies manipulation
*/
function setCookie(name, value) {
  var today = new Date();
  var exp_date = new Date();
  exp_date.setTime(today.getTime() + (365*24*60*60*1000));
  
  document.cookie = name + "=" + value + ";expires=" + exp_date.toGMTString();
}

function getCookie(name) {
  if (document.cookie.length>0) {
    cookie_start = document.cookie.indexOf(name + "=");
    if (cookie_start != -1) {
      cookie_start = cookie_start + name.length + 1;
      cookie_end = document.cookie.indexOf(";", cookie_start);
      
      if (cookie_end == -1) {
        cookie_end = document.cookie.length;
      }
      
      return unescape(document.cookie.substring(cookie_start,cookie_end));
    }
  }
  
  return "";
}

/*
  XBMC Request
*/
var XbmcRequest = {
  /* Retrieve the key code for charac
    key code = OxFxxx where xxx is an hexadecimal ascii char code */
  getKeyCode: function(charac) {
    var asciiHexCode = charac.charCodeAt(0).toString(16); // ASCII code (hexadecimal)
    var zeros = ""; // String that will contains 0 to complete the code length

    for(i=0,j=(3-asciiHexCode.length);i<j;i++) zeros = ""+ zeros + "0"

    return "0xF" + zeros + asciiHexCode;
  },
  
  /* Retrieve the XBMC serveur URL */
  getServerUrl: function() {
    return "http://"+ window.location.hostname +":"+ window.location.port;
  },
  
  /* Send JSON RPC Request */
  sendJSonRPCRequest: function(method, params) {
    var executeRequest = true;
    if(method=="System.Shutdown") {
      executeRequest = confirm("Are you sure you want to shutdown the system ?");
    }

    if(executeRequest) {
      var http_request = new XMLHttpRequest();
      http_request.open("POST", this.getServerUrl() +"/jsonrpc", true);
      http_request.send('{"jsonrpc": "2.0", "method": "' + method  + '", "params": ' + params + ', "id": 1}');
    }
  },
  
  /* Send HTTP API request */
  sendHttpAPIRequest: function (command_type, command) {
    var url = null;
    
    switch(command_type) {
      case 'action':
        url = this.getServerUrl() + "/xbmcCmds/xbmcHttp?command=Action("+ command +")";
        break;
        
      case 'key':
        if(command=='up') {
          command = '&';
        }
        else if(command=='down') {
          command = '(';
        }
        else if(command=='left') {
          command = '%';
        }
        else if(command=='right') {
          command = '\'';
        }
        else if(command=='enter') {
          command = '\r';
        }
        else if(command=='back') {
          command = '\b';
        }
        else {
          // do nothing
        }
        
        url = this.getServerUrl() + "/xbmcCmds/xbmcHttp?command=SendKey("+ this.getKeyCode(command) +")";
        break;
    }
    
    var http_request = new XMLHttpRequest();
    http_request.open("GET", url, true);
    http_request.send(null);
  },
  
  /*
    type = 'JSON-RPC' or 'HTPP-API'
    command = JSON-RPC method / HTTP-API 'key' or 'action'
    params = JSON-RPC params / HTTP-API key to press or action to trigger
  */
  send: function(type, command, params) {    
    switch(type) {
      case 'JSON-RPC':
        params = params ? params : '{}';
        this.sendJSonRPCRequest(command, params);
        break;
      
      case 'HTTP-API':
        this.sendHttpAPIRequest(command, params);
        break;
    }
  }
}


/* iPhoneUI */
var iPhoneUI = {
  init: function() {
    if(!window.navigator.standalone) {
      removeClass(document.getElementById('add-to-homescreen'), 'hidden');
    }
    else {
      // Detect orientation
      iPhoneUI.orientation();
      
      // Set the location
      var anchor = 'controller';
      if(window.location.hash) {
        anchor = window.location.hash.replace('#','')
      }
      else {
        window.location = window.location+'#'+ anchor
      }
      
      // Add / Remove .hidden class, also look at :target from remote.css
      var sections = document.getElementsByTagName('section');
      for(var i=0, j=sections.length; i<j; i++) {
        if(sections[i].id!=anchor) {
          addClass(sections[i], 'hidden');
        }
        else {
          removeClass(sections[i], 'hidden');
        }
      }
    }
  },
  
  transition: function(link, backside) {
    var current = document.getElementById(link.parentNode.parentNode.parentNode.id);
    var to = document.getElementById(link.id.replace('to_',''));
    
    removeClass(to, 'hidden');
    
    if(backside) {
      addClass(current, 'slideToRight');
    }
    else {
      addClass(current, 'slideToLeft');
    }
    
    window.setTimeout(function() {
      addClass(current, 'hidden');
    }, 600);
  },
  
  orientation: function() {
    var orient = (window.orientation==0 || window.orientation==180) ? 'portrait' : 'landscape';
    document.body.className = orient;
  },
  
  toggleButton: function(id, state) {
    if(state == true) {
      addClass(id, 'on');
      removeClass(id,'off');
    }
    else {
      addClass(id, 'off');
      removeClass(id, 'on');
    }
  }
}

/* iRemoteGestures */
var iRemoteGestures = {
  init: function(id) {
    // Listeners
    element = document.getElementById(id);
    element.addEventListener("touchstart", this.touchStart, false);
    element.addEventListener("touchmove", this.touchMove, false);
    element.addEventListener("touchend", this.touchEnd, false);
    element.addEventListener("touchcancel", this.touchCancel, false);
    
    // Gesture object
    element.gesture = {};
    element.gesture.touches = 0;
    element.gesture._start = { _x: 0, _y: 0 };
    element.gesture._stop = { _x: 0, _y: 0 };
    element.gesture._threshold = { _x: 15, _y: 15 };
    element.gesture.is_scrolling = false;
    element.gesture.direction = null;
    element.gesture.triggered = false;
  },
  
  touchStart: function(event) {
    event.preventDefault();
    
    this.gesture.touches = event.touches.length;
    this.gesture._start._x = event.touches[0].pageX;
    this.gesture._start._y = event.touches[0].pageY;
    this.gesture._stop._x = event.touches[0].pageX;
    this.gesture._stop._y = event.touches[0].pageY;    
  },
  
  touchMove: function(event) {
    event.preventDefault();
    
    this.gesture._stop._x = event.touches[0].pageX;
    this.gesture._stop._y = event.touches[0].pageY;
    
    // Horizontal or vertical direction ?
    this.gesture.direction = Math.abs(this.gesture._start._x-this.gesture._stop._x) > Math.abs(this.gesture._start._y-this.gesture._stop._y) ? 'horizontal' : 'vertical';
    
    // One finger gesture
    if(this.gesture.touches==1) {
      // No scroll action already launched
      if(!element.gesture.is_scrolling) {
        // Up, down direction = continue scrolling
        // Action only launched if the threshold is exceeded
        if(this.gesture.direction == 'vertical' && (this.gesture._start._y > this.gesture._stop._y) && ((this.gesture._start._y - this.gesture._threshold._y) >= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('HTTP-API','key','up'); // Up
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);
          this.gesture.triggered = true;
        }
        else if(this.gesture.direction == 'vertical' && (this.gesture._start._y < this.gesture._stop._y) && ((this.gesture._start._y+this.gesture._threshold._y) <= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('HTTP-API','key','down'); // Down
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);      
          this.gesture.triggered = true;  
        }
      }
      else {
        // Scroll already launched, so do nothing
      }
    }
  },
  
  touchEnd: function(event) {
    event.preventDefault();
    
    // One finger gesture, if the action hasn't already been triggered (see touchMove)
    if(!this.gesture.triggered && this.gesture.touches==1) {
      // Tap - regular click
      if(this.gesture._start._x == this.gesture._stop._x && this.gesture._start._y == this.gesture._stop._y) {
        XbmcRequest.send('HTTP-API','key','enter'); // Ok
      }
      // Gesture
      else {
        if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x - this.gesture._threshold._x) >= this.gesture._stop._x)) {
          XbmcRequest.send('HTTP-API','key','left'); // Left
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold._x) <= this.gesture._stop._x)) {
          XbmcRequest.send('HTTP-API','key','right'); // Right
        }
        else {
          XbmcRequest.send('HTTP-API','key','enter'); // Ok
        }
      }
    }
    // Two fingers gesture
    else if(this.gesture.touches==2) {
      // Tap - regular click
      if(this.gesture._start._x == this.gesture._stop._x && this.gesture._start._y == this.gesture._stop._y) {
        XbmcRequest.send('HTTP-API','key','C');  // Context menu
      }
    }
    else {
      // Actually we don't support gestures with 3 fingers or more
    }    
    
    // Initialize values for the next event
    this.gesture.touches = 0;
    this.gesture._start = { _x: 0, _y: 0 };
    this.gesture._stop = { _x: 0, _y: 0 };
    this.gesture.is_scrolling = false;
    this.gesture.direction = null;
    this.gesture.triggered = false;
  },
  
  touchCancel: function(event) {
    event.preventDefault();
  }
}


/* iRemote */
var iRemote = {
  gestures_state: false,
  
  init: function() {
    // Init the gestures mode (listeners, vars)
    iRemoteGestures.init('gestures_logo');
    
    // Init gestures toggle button
    this.gestures_state = getCookie('gestures') == 'true' ? true : false;
    iPhoneUI.toggleButton(document.getElementById('gestures_toggle'), this.gestures_state);
    
    // Show the controller image (or not)
    this.showController(this.gestures_state);
  },
  
  // Apply gestures mode (when selected in "settings')
  gestures: function() {
    this.gestures_state = this.gestures_state ? false : true;
    
    // Update the toggle button
    iPhoneUI.toggleButton(document.getElementById('gestures_toggle'), this.gestures_state);
    
    // Set the cookie
    setCookie('gestures', ''+ this.gestures_state +'');
    
    // Update the view
    this.showController(this.gestures_state);
  },
  
  /* Show the controller or the gestures mode logo */
  showController: function(gestures_state) {
    gestures_logo = document.getElementById('gestures_logo');
    controller_img = document.getElementById('controller_img');
    
    if(gestures_state == true) {
      removeClass(gestures_logo, 'hidden');
      addClass(controller_img, 'hidden');
    }
    else {
      removeClass(controller_img, 'hidden');
      addClass(gestures_logo, 'hidden');
    }
  }
}

/* Main */
window.onload = function() {
  iPhoneUI.init();
  iRemote.init();
};

window.onorientationchange = function() {
  iPhoneUI.orientation();
};