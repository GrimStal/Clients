/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */
"use strict";

function initObject() {
    this.mac = '';
    this.M3U_url = '';
    this.EPG_url = '';
    this.login = '';
    this.password = '';

    this.setMac = function (mac) {

        if (!mac) {
            return false;
        }

        var temp = mac.trim().replace(/[-]/g, ':');
        var chanReg = /^(?:[A-Fa-f0-9]{2}(?:[:])){5}[A-Fa-f0-9]{2}$/;

        temp = chanReg.exec(temp);

        if (temp === null || typeof (temp) === undefined) {
            return false;
        }

        this.mac = temp[0];

        return true;
    };

    this.setM3U = function (url) {
        //var urlExp = /.+\.m3u/;
        if (!url) {//|| !urlExp.exec(url)){
            return false;
        }
        this.M3U_url = url;
        return true;
    };

    this.setEPG = function (url) {
        //var urlExp = /.+\.xml/;
        if (!url) {//|| !urlExp.exec(url)){
            return false;
        }
        this.EPG_url = url;
        return true;
    };

    this.setLogin = function (login) {
        var loginExp = /^[0-9a-zA-Z\-_\.@!]+$/;
        if (!login || !loginExp.exec(login)) {
            return false;
        }
        this.login = login;
        return true;
    };

    this.setPassword = function (password) {
        var passwordExp = /^[0-9a-zA-Z\-_\.@!]*$/;
        if (!password || !passwordExp.exec(password)) {
            return false;
        }
        this.password = password;
        return true;
    };
}