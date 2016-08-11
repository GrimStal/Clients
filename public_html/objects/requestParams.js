/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

function requestParams() {
    this.restMethod;
    this.url;
    this.dataType;
    this.data;
    this.crossDomain;
    this.headers;
    this.timeout = 5000;
    this.successFunction = function () {};
    this.errorFunction = function () {};

    this.setRequest = function (restMethod, url, successFunction, errorFunction) {
        if (!restMethod || !url ||
                (!successFunction || typeof successFunction != 'function') ||
                (!errorFunction || typeof errorFunction != 'function')) {
            return false;
        }

        this.restMethod = restMethod;
        this.url = url;
        this.successFunction = successFunction;
        this.errorFunction = errorFunction;

        return true;
    };

    this.setCrossDomain = function (boolean) {
        if (!boolean) {
            return false;
        }
        this.crossDomain = boolean;
        return true;
    };

    this.setDataType = function (string) {
        if (!string) {
            return false;
        }
        this.dataType = string;
        return true;
    };

    this.setData = function (object) {
        if (!object) {
            return false;
        }
        this.data = object;
        return true;
    };

    this.setHeaders = function (object) {
        if (!object) {
            return false;
        }
        this.headers = object;
        return true;
    };

    this.setTimeout = function (int) {
        if (!int) {
            return false;
        }
        this.timeout = int;
        return true;
    };
};

