//Copyright StoneFinch LLC, 2013. All rights reserved

/// <reference path="jquery-1.10.2.js" />

$.ajaxJson = function (options) {

    options.type = "POST";
    options.dataType = "json";
    options.contentType = "application/json";
    
    $.ajax(options); 

};

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}
