/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

if (typeof getlog !== 'function') {
    var debugMode;
    var getlog = function (text) {
        if (debugMode) {
            console.log(text);
        }
    };
}

function M3UClient() {

    this._DataURL = null;
    this._epgURL;
    this._inited = false;
//    this._tvgNamesArray;
    this._epgProgramms = false;
//    this._renewEPGTimer;

    this.init = function (initer) {
        var checker = $.Deferred();

        if (typeof (M3UParser) !== 'function') {
            checker.reject('load M3UParser library first')
            return checker.promise();
        }

        if (typeof (initObject) !== 'function') {
            checker.reject('load initObject library first')
            return checker.promise();
        }

        if (!initer.M3U_url) {
            checker.reject('m3u link is not set')
            return checker.promise();
        }

        this.parser = new M3UParser();
        this._DataURL = initer.M3U_url;

        if (initer.EPG_url) {
            this._epgURL = initer.EPG_url;
        }
        this._inited = true;
        checker.resolve("Init done");

        return checker.promise();
    };

    this.clearData = function () {
        return true;
    };

    this._setAjaxRequest = function (requestParams) {

        var df = $.Deferred();
        $.ajax({
            type: requestParams.restMethod,
            url: requestParams.url,
            dataType: requestParams.dataType,
            data: requestParams.data,
            crossDomain: (requestParams.crossDomain != undefined) ? requestParams.crossDomain : false,
            headers: requestParams.headers,
            timeout: (requestParams.timeout != undefined) ? requestParams.timeout : 5000,
            success: function (data) {
                requestParams.successFunction(data);
                df.resolve(data);
            },
            error: function (data) {
                requestParams.errorFunction(data);
                df.reject(data);
            }
        });
        return df.promise();
    };

    this._sendDataRecieveRequest = function (url, encoding) {
        var result = $.Deferred();
        var error;
        var request;

        if (typeof (requestParams) !== 'function') {
            result.reject("load requestParams library first");
            return result.promise();
        }

        if (!url) {
            result.reject("URL not selected");
            return result.promise();
        }

        function successFunc(data) {
            result.resolve(data);
        }

        function errorFunc(data) {
            if (data) {
                if (data.statusText && data.statusText == "error") {
                    error = "Server doesn't answer";
                } else {
                    error = data;
                }
            } else {
                error = "Can't get data";
            }
            result.reject(error);
        }

        request = new requestParams();
        request.setRequest("GET", url, successFunc, errorFunc);
        request.setCrossDomain(true);
        request.setTimeout(10000);
        if (encoding) {
            request.setHeaders({"Accept-Encoding": "gzip"});
        }
        this._setAjaxRequest(request);

        return result.promise();
    };

    this.getChannels = function (genre_id) {
        var self = this;
        var result = $.Deferred();

        if (!this._inited) {
            result.reject("You need init() first");
            return result.promise();
        }

        this._sendDataRecieveRequest(this._DataURL).then(
                function (data) {
                    var channelsArray = self.parser.ChannelsArrayParser(data, genre_id, self._epgIDs);
                    if (channelsArray && channelsArray.length > 0 && channelsArray[0].name != "ПУСТОЙ СПИСОК") {
                        result.resolve(channelsArray);
                    } else {
                        result.reject('Channels not recieved');
                    }
                },
                function (data) {
                    result.reject(data);
                });
        return result.promise();
    };

    this.getGenres = function () {
        var self = this;
        var result = $.Deferred();

        this.getChannels().then(
                function (channelsContainer) {
                    result.resolve(self.parser.GenreArrayParser(channelsContainer));
                },
                function () {
                    result.reject("Channels not recieved");
                });
        return result.promise();
    };

    /**
     * @param {Object} channelObject
     * @param {number} amount   -   amount of programms to get including current
     * @returns {unresolved}    -   Programms from current time including 
     * current to day end or selected amount
     */
    this.getEPG = function (channelObject, amount) {    //amount = amount of programms including current
        var self = this;
        var result = $.Deferred();
        var chanReg = /[0-9]+/;
        var nextAmount;
        var channelEPG;
        var epgResult;

        if (!this._inited) {
            result.reject("You need init() first");
        } else if (!channelObject) {
            result.reject('Channel not selected');
        } else if (!amount || !chanReg.exec(amount)) {
            result.reject('Amount not set');
        } else if (!this._epgURL || !this._epgProgramms) {
            result.reject('EPG not available');
        } else {
            nextAmount = amount;
            channelEPG = this.parser.EPGArrayParser(this._epgProgramms, channelObject);
            epgResult = this.parser.ParseForToday(channelEPG, nextAmount);

            if (epgResult) {
                result.resolve(epgResult);
            } else {
                result.reject('EPG not available');
            }
        }

        return result.promise();
    };

    this.getEPGForDate = function (channelObject, date) {
        var self = this;
        var selectedDate;
        var nextDate;
        var result = $.Deferred();

        if (!this._inited) {
            result.reject("You need init() first");
        } else if (!channelObject) {
            result.reject('No channel selected');
        } else if (!this._epgURL) {
            result.reject('EPG not available');
        } else if (!date) {
            result.reject('Date not selected');
        } else {
            selectedDate = new Date(date).setHours(0, 0, 0, 0);
            nextDate = new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1);

            var channelEPG = this.parser.EPGArrayParser(this._epgProgramms, channelObject);
            var epgResult = this.parser.ParseWithDate(channelEPG, selectedDate / 1000, nextDate / 1000);

            if (epgResult) {
                result.resolve(epgResult);
            } else {
                result.reject('EPG not available');
            }
        }

        return result.promise();
    };

    this.getChannelLink = function (channelObject) {
        var result = $.Deferred();

        if (!channelObject || !channelObject.URL) {
            result.reject('No channel URL');
        } else {
            result.resolve(channelObject.URL);
        }

        return result.promise();
    };

    this.addFavorite = function (channelObj) {
        var result = $.Deferred();
        result.resolve(false);
        return result.promise();
    };

    this.deleteFavorite = function (channelObj) {
        var result = $.Deferred();
        result.resolve(false);
        return result.promise();
    };

    this.dropTimers = function () {
        clearTimeout(this._renewEPGTimer);
    };

    this.renewEPG = function (channelsContainer) {
        var self = this;
        var result = $.Deferred();

        if (!channelsContainer || !self._epgURL) {
            result.reject('EPG not available');
        } else {
            var tempTime = new Date().getTime();   ///
            console.log("Start downloading file " + tempTime);  ///
            self._sendDataRecieveRequest(self._epgURL, "gzip").then(
                    function (epgFile) {
                        console.log("End downloading file " + new Date().getTime() + " " + (new Date().getTime() - tempTime));
                        tttt = epgFile;
//                        self._epgProgramms = self.parser.epgFileParser(epgFile, channelsContainer);
                        result.resolve('EPG recieved');
                    },
                    function (error) {
                        self._epgProgramms = false;
                        result.reject(error);
                    });
        }
        ;

        return result.promise();
    };
}
