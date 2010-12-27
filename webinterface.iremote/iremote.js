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


var iPhoneUI = {
  init: function() {    
    if(!window.navigator.standalone) {
      removeClass(document.getElementById('add-to-homescreen'), 'hidden');
    }
    else {    
      var anchor = 'controller';
    
      if(window.location.hash) {
        anchor = window.location.hash.replace('#','')
      }
      else {
        window.location = window.location+'#'+ anchor
      }
      
      // Add / Remove .hidden class, also see :target into css file
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
  }
}


window.onload = function() {
  iPhoneUI.init();
  iPhoneUI.orientation();
};

window.onorientationchange = function() {
  iPhoneUI.orientation();
};