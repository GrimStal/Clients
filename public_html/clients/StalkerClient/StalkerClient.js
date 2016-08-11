/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

if (typeof getlog !== 'function') {
    var debugMode;
    var getlog = function (text) {
        if (debugMode){
            console.log(text);
        }
    };
}

function StalkerClient() {

    this._authData = null;
    this._mac;
    this._AuthURL = "http://ott.briz.ua/stalker_portal/auth/token.php";
    this._DataURL = "http://v2.api.ott.briz.ua/stalker_portal/api/users/";
    this._userActivityTimer = null;
    this._inited = false;
    this._login = '';
    this._password = '';

    this.init = function (initer) {
        var self = this;
        var checkInit = $.Deferred();

        if (typeof (initObject) !== 'function') {
            checkInit.reject('load initObject library first');
            return checkInit.promise();
        }

        if (typeof (authObject) !== 'function') {
            checkInit.reject('load authObject library first');
            return checkInit.promise();
        }

        if (typeof (StalkerParser) !== 'function') {
            checkInit.reject('load Parser library first');
            return checkInit.promise();
        }

        if (!initer.mac) {
            checkInit.reject('MAC not set');
            return checkInit.promise();
        }

        this._mac = initer.mac;
        this._login = initer.login;
        this._password = initer.password;
        this._authData = new authObject();
        this.parser = new StalkerParser();

        this._loginUser().then(
                function (data) {
                    self._inited = true;
                    self._updateUserActivity();
                    checkInit.resolve("Init done");
                },
                function (data) {
                    checkInit.reject(data);
                });

        return checkInit.promise();
    };
    
    this.clearData = function(){
        if (this._authData !== null){
            this._authData.clear();
        }
        
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

    this._lookForLogin = function () {
        var status = $.Deferred();

        if (!this._inited) {
            status.reject('Not inited');
            return status.promise();
        }

        if (this._authData.isLogin() === false) {
            if (this._authData.refreshToken !== null) {
                this._refreshToken().then(
                        function (data) {
                            status.resolve(data);
                        },
                        function (data) {
                            status.reject(data);
                        });
            } else {
                this._loginUser().then(
                        function (data) {
                            status.resolve(data);
                        },
                        function (data) {
                            status.reject(data);
                        });
            }

        } else {
            status.resolve('Sucessful');
        }

        return status.promise();
    };

    this._sendAuthorizationRequest = function (request_data) {
        var self = this;
        var status = $.Deferred();
        var error;
        var request;

        if (typeof requestParams !== 'function') {
            status.reject("load requestParams library first");
            return status.promise();
        }

        function successFunc(data) {
            if (data) {
                self._authData.set(data);
                if (self._authData.isLogin() === true) {
                    self._updateUserActivity();
                    status.resolve(data);
                } else if (data.error_description) {
                    status.reject(data.error_description);
                } else {
                    status.reject(data);
                }
            } else {
                status.reject("Unknown mistake");
            }
        }

        function errorFunc(data) {
            clearTimeout(self._userActivityTimer);
            if (data) {
                if (data.responseJSON && data.responseJSON.error) {
                    error = data.responseJSON.error;
                } else {
                    error = "Server doesn't answer";
                }
            } else {
                error = "Unknown mistake";
            }
            status.reject(error);
        }

//        window.Iptv.setEventInfo("Авторизация", '#c9c827');
        getlog("Авторизация");
        request = new requestParams();
        request.setRequest("POST", this._AuthURL, successFunc, errorFunc);
        request.setDataType("json");
        request.setHeaders({"Content-Type": "application/x-www-form-urlencoded"});
        request.setData(request_data);
        request.setCrossDomain(true);
        this._setAjaxRequest(request);

        return status.promise();
    };

    this._sendActivityRequest = function (rest_url, RestMethod, ContentType, Data) {
        var self = this;
        var result = $.Deferred();
        var url;
        var request;
        var error;

        if (!rest_url || !RestMethod) {
            result.reject(false);
            return result.promise();
        }

        if (typeof requestParams !== 'function') {
            result.reject("load requestParams library first");
            return result.promise();
        }

        function successFunc(data) {
            if (data.status && data.status === 'OK') {
                result.resolve("Activity request done");
            } else {
                result.reject('Activity request failed');
            }
            ;
        }

        function errorFunc(data) {
            if (data) {
                if (data.responseJSON && data.responseJSON.error) {
                    error = data.responseJSON.error;
                } else {
                    error = "Activity request failed";
                }
            } else {
                error = 'Activity request failed';
            }
            result.reject(error);
        }

        this._lookForLogin().then(
                function () {
                    url = self._DataURL + self._authData.userID + rest_url;
                    request = new requestParams();
                    request.setRequest(RestMethod, url, successFunc, errorFunc);
                    request.setDataType("json");
                    request.setData(Data);
                    request.setHeaders({"Authorization": "Bearer " + self._authData.accessToken, "Content-Type": ContentType});
                    request.setCrossDomain(true);
                    self._setAjaxRequest(request);
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this._sendDataRecieveRequest = function (rest_url) {
        var self = this;
        var result = $.Deferred();
        var url;
        var request;
        var error;

        if (typeof (requestParams) !== 'function') {
            result.reject("load requestParams library first");
            return result.promise();
        }

        function successFunc(data) {
            if (data.status === 'OK' && data.results) {
                result.resolve(data.results);
            } else {
                result.reject(data);
            }
        }

        function errorFunc(data) {
            if (data) {
                if (data.responseJSON && data.responseJSON.error) {
                    error = data.responseJSON.error;
                } else {
                    error = "Server doesn't answer";
                }
            } else {
                error = "Unknown mistake";
            }

            /** fix for reconnect if access token was generated
             * for another client with same auth data
             * */
            if (error == "Access token wrong or expired") {
                self._authData.clear();
                self._sendDataRecieveRequest(rest_url).then(
                        function (data) {
                            result.resolve(data);
                        },
                        function (error) {
                            result.reject(error);
                        });
            } else {
                result.reject(error);
            }
        }

        this._lookForLogin().then(
                function () {
                    url = self._DataURL + self._authData.userID + rest_url;
                    request = new requestParams();
                    request.setRequest("GET", url, successFunc, errorFunc);
                    request.setDataType("json");
                    request.setCrossDomain(true);
                    request.setHeaders({"Authorization": "Bearer " + self._authData.accessToken});
                    self._setAjaxRequest(request);
                },
                function (data) {
                    result.reject(data);
                });
        return result.promise();
    };

    this._sendFavoritesRequest = function (rest_method, channelID) {
        var self = this;
        var result = $.Deferred();
        var url;
        var request;
        var error;

        if (typeof (requestParams) !== 'function') {
            result.reject("load requestParams library first");
            return result.promise();
        }

        if (!rest_method) {
            result.reject("REST method not set");
            return result.promise();
        }

        function successFunc(data) {
            if (data.status === 'OK' && data.results) {
                result.resolve(data.results);
            } else {
                result.reject("Delete failed");
            }
        }

        function errorFunc(data) {
            if (data) {
                if (data.responseJSON && data.responseJSON.error) {
                    error = data.responseJSON.error;
                } else {
                    error = "Server doesn't answer";
                }
            } else {
                error = "Unknown mistake";
            }

            if (error == "Access token wrong or expired") {
                self._authData.clear();
                self._sendFavoritesRequest(rest_method, channelID).then(
                        function (data) {
                            result.resolve(data);
                        },
                        function (error) {
                            result.reject(error);
                        });
            } else {
                result.reject(error);
            }
        }

        this._lookForLogin().then(
                function () {
                    request = new requestParams();

                    url = self._DataURL + self._authData.userID + "/tv-favorites";

                    if (channelID && typeof channelID == "number") {
                        if (rest_method == "DELETE") {
                            url += "/" + channelID;
                        } else {
                            request.setData({"ch_id": channelID});
                        }
                    }

                    request.setRequest(rest_method, url, successFunc, errorFunc);
                    request.setDataType("json");
                    request.setCrossDomain(true);
                    request.setHeaders({"Authorization": "Bearer " + self._authData.accessToken});
                    self._setAjaxRequest(request);
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this._loginUser = function () {
        var data = null;
        var status = $.Deferred();

        if (!this._mac) {
            status.reject('MAC not set');
        } else {
            data = "grant_type=password&username=" + this._login + "&password=" + this._password + "&mac=" + this._mac;
            status = this._sendAuthorizationRequest(data);
        }

        return status.promise();
    };

    this._refreshToken = function () {
        var data = null;
        var status = $.Deferred();

        if (!this._authData.refreshToken) {
            status.reject('No refresh token');
        } else {
            data = "grant_type=refresh_token&refresh_token=" + this._authData.refreshToken;
            status = this._sendAuthorizationRequest(data);
        }

        return status.promise();
    };

    this._updateUserActivity = function () {
        var self = this;

        clearTimeout(this._userActivityTimer);

        this._sendActivityRequest("/ping", "GET").then(
                function (response) {
                    getlog("User activity: " + response);
                    self._userActivityTimer = setTimeout(function () {
                        self._updateUserActivity();
                    }, 2 * 60 * 1000);
                },
                function (response) {
                    getlog("User activity: " + response);
                });
    };

    this._updateUserChannelActivity = function (channelID) {
        this._sendActivityRequest("/media-info", "POST", "application/x-www-form-urlencoded", {"type": "tv-channel", "media_id": channelID}).always(
                function (response) {
                    getlog("Update channel activity: " + response);
                });
    };

    this._deleteUserChannelActivity = function () {
        this._sendActivityRequest("/media-info", "DELETE", "application/x-www-form-urlencoded").always(
                function (response) {
                    getlog("Delete channel activity: " + response);
                });
        ;
    };

    this.getChannels = function (genre_id, onlyFavorite) {
        var self = this;
        var result = $.Deferred();
        var url = '';

        if (!genre_id || genre_id.length == 0) {
            url = '/tv-channels';
        } else {
            url = '/tv-genres/' + genre_id + '/tv-channels';
        }


        if (onlyFavorite) {
            url += "?mark=favorite";
        }

        this._sendDataRecieveRequest(url).then(
                function (data) {
                    result.resolve(self.parser.ChannelsArrayParser(data));
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this.getGenres = function () {

        var self = this;
        var result = $.Deferred();

        var url = '/tv-genres';

        this._sendDataRecieveRequest(url).then(
                function (data) {
                    result.resolve(self.parser.GenresArrayParser(data));
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this.getChannelLink = function (channelObject) {
        var self = this;
        var result = $.Deferred();
        var chanReg = /[0-9]+/;

        if (!channelObject || !channelObject.channelID || !chanReg.exec(channelObject.channelID)) {
            result.reject('No channelID');
        } else {
//			self._deleteUserChannelActivity();
            var url = '/tv-channels/' + channelObject.channelID + '/link';
            result = this._sendDataRecieveRequest(url);
            result.then(function () {
                self._updateUserChannelActivity(channelObject.channelID);
            });
        }

        return result.promise();
    };

    /**
     * @param {Object} channelObject
     * @param {number} amount   -   amount of programms to get including current
     * @returns {unresolved}    -   Programms from current time including 
     * current to day end or selected amount
     */
    this.getEPG = function (channelObject, amount) {
        var self = this;
        var result = $.Deferred();
        var chanReg = /[0-9]+/;
        var nextAmount;
        var url;

        if (!channelObject.tvgName || !chanReg.exec(channelObject.tvgName)) {
            result.reject('Channel not selected');
        } else if (!amount || !chanReg.exec(amount)){
            result.reject('Amount not set');
        }else {
            nextAmount = "?next=" + amount;
            url = '/tv-channels/' + channelObject.tvgName + '/epg' + nextAmount;
            this._sendDataRecieveRequest(url).then(
                    function (data) {
                        result.resolve(self.parser.EPGArrayParser(data, channelObject.tvgName));
                    },
                    function (data) {
                        result.reject(data);
                    });
        }

        return result.promise();
    };

    this.getEPGForDate = function (channelObject, date) {
        var self = this;
        var result = $.Deferred();
        var chanReg = /[0-9]+/;
        var selectedDate;
        var nextDate;

        if (!channelObject.tvgName || !chanReg.exec(channelObject.tvgName)) {
            result.reject('Channel not selected');
        } else if (!date) {
            result.reject('Date not selected');
        } else {
            selectedDate = moment(date).tz("Europe/Kiev").startOf('day').unix();
            nextDate = moment.unix(selectedDate).tz("Europe/Kiev").add(1, 'days').unix();

            var url = '/tv-channels/' + channelObject.tvgName + '/epg?from=' + selectedDate + '&to=' + nextDate;

            this._sendDataRecieveRequest(url).then(
                    function (data) {
                        result.resolve(self.parser.EPGArrayParser(data, channelObject.tvgName));
                    },
                    function (data) {
                        result.reject(data);
                    });

        }

        return result.promise();
    };

    this.addFavorite = function (channelObj) {
        var result = $.Deferred();

        if (typeof channelObject != "function") {
            result.reject("load channelObject library first");
            return result.promise();
        }

        if (!channelObj) {
            result.reject("channel not set");
            return result.promise();
        }

        this._sendFavoritesRequest("POST", channelObj.channelID).then(
                function (data) {
                    result.resolve(true);
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this.deleteFavorite = function (channelObj) {
        var result = $.Deferred();

        if (typeof channelObject != "function") {
            result.reject("load channelObject library first");
            return result.promise();
        }

        if (!channelObj) {
            result.reject("channel not set");
            return result.promise();
        }

        this._sendFavoritesRequest("DELETE", channelObj.channelID).then(
                function () {
                    result.resolve(true);
                },
                function (data) {
                    result.reject(data);
                });

        return result.promise();
    };

    this.dropTimers = function () {
        clearTimeout(this._userActivityTimer);
    };

    this.renewEPG = function () {
        var result = $.Deferred();
        result.resolve(false);
        return result.promise();
    };
}
;
