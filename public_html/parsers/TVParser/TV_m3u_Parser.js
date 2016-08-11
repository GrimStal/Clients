/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

function M3UParser() {

    /**
     * 
     * @param {type} response
     * @returns {Array|M3UParser.GenreArrayParser.genres|Boolean}
     * 0 - Empty array if nothing found or no or empty response
     * 1 - array of genres
     * 2 - false if channelObject not set
     */
    this.GenreArrayParser = function (response) {
        if (typeof (channelObject) !== 'function') {
            return false;
        }

        var genres = [];
        var genresArray = [];

        for (var i = 0; i < response.length; i++) {
            var genre = response[i].groupTitle;
            if (genre && $.inArray(genre, genresArray) == -1) {
                genresArray.push(genre);
            }
        }

        for (var i = 0; i < genresArray.length; i++) {
            genres.push({id: genresArray[i], title: genresArray[i]});
        }
        
        genres.unshift({id: '', title: 'Все каналы'});

        return genres;
    };

    this.ChannelsArrayParser = function (data, genre_id) {

        var channelsContainer = [];
        var name;
        var URL;
        var channelID;
        var image;
        var tvgName;
        var groupTitle;
        var favorite;
        var tempContainer = this._M3UParse(data);

        if (tempContainer && tempContainer.length !== 0) {
            for (var i = 0; i < tempContainer.length; i++) {
                name = (tempContainer[i].name) ? tempContainer[i].name.trim() : false;
                URL = (tempContainer[i].URL) ? tempContainer[i].URL.trim() : false;
                channelID = (tempContainer[i].channelID) ? tempContainer[i].channelID.trim() : false;
                image = (tempContainer[i].image) ? tempContainer[i].image.trim() : false;
//                tvgName = (tempContainer[i].tvgName) ? tempContainer[i].tvgName.trim() : false;
                tvgName = "-";
                groupTitle = (tempContainer[i].groupTitle) ? tempContainer[i].groupTitle.trim() : false;
                favorite = 0;
                if (name && URL && channelID) {
                    var channel = new channelObject();
                    if (genre_id && genre_id === groupTitle) {
                        channel.set(name, URL, channelID, image, tvgName, groupTitle, favorite);
                        channelsContainer.push(channel);
                    } else if (!genre_id) {
                        channel.set(name, URL, channelID, image, tvgName, groupTitle, favorite);
                        channelsContainer.push(channel);
                    }
                }
            }
        } else {
            var channel = new channelObject();
            channel.set("ПУСТО", '0', false, false, '-', false, 0);
            channelsContainer.push(channel);
        }
        return channelsContainer;
    };

    this._M3UParse = function (data) {
        if (typeof (channelObject) !== 'function') {
            return false;
        }

        var chanReg = /#EXTINF:-?(\d*).*?(?:\stvg-name="(.*?)")?(?:\sgroup-title="(.*?)")?(?:\stvg-logo="(.*?)")?.*?,([^#\n]*)(?:#EXTGRP:(.*))?/;
        var chanRegGenre = /#EXTGRP:(.+)/;
        var chanRegHTTPStream = /^http:\/\/.*$/;
        var chanRegUDPStream = /^udp:\/\/@.*$/;

        var groupTitle;
        var tempArray = [];
        var cleanArray = [];
        var arr = data.split(/(\n|\r|\n\r|\r\n)/);

        for (var i = 0; i < arr.length; i++) {
            var str = arr[i];
            if (str !== "#EXTM3U" && str.length > 0) {
                if (chanReg.exec(arr[i]) || chanRegHTTPStream.exec(arr[i]) || chanRegUDPStream.exec(arr[i])) {
                    tempArray.push(arr[i]);
                } else if (chanRegGenre.exec(arr[i]) && chanReg.exec(tempArray[tempArray.length - 1])) {
                    tempArray[tempArray.length - 1] += String(arr[i]);
                }
            }
        }

        for (var i = 0; i < tempArray.length; i++) {
            var chanParse = chanReg.exec(tempArray[i]);
            if (chanParse) {
                i++;
                groupTitle = (chanParse[3]) ? chanParse[3].trim() : (chanParse[6]) ? chanParse[6].trim() : '';
                var channel = new channelObject();
                channel.set(chanParse[5], tempArray[i], chanParse[1], chanParse[4], chanParse[2], groupTitle);
                cleanArray.push(channel);
            }
        }

        return cleanArray;
    };

    /** Parses the EPG file to get only programms set in channelsContainer
     * WARNING! Also resets the tvgName in channel objects
     * 
     * @param {string} epgFile  -   xmltv file
     * @param {array} channelsContainer -   array of channel objects
     * @returns {Array|Boolean}
     * 0 - array of programms only for channels in channelsContainer array
     * 1 - false if epgFile or channelsContainer not set
     */
    this.epgFileParser = function (epgFile, channelsContainer) {
        var tempTime1 = new Date().getTime();                       ///
        console.log("Start parsing file " + tempTime1);  ///

//        if (!epgFile || (!channelsContainer || channelsContainer.length == 0)) {
//            return false;
//        }
//
//        var epgIDArray = [];
//        var epgProgrammeArray = [];
//        var epgIDTemp = [];
//        var epgProgrammeTemp = [];
//        var dataArray = [];
//
//        var epgIDObject = {'id': '', 'eng': '', 'rus': '', 'noLang': '', 'icon': ''};
//        var chanIDReg = /(?:<channel.*?id\s?=\s?["'](.*?)['"]\s*?>)/;
//        var chanEngTitleReg = /(?:<display-name.*?lang\s?=\s?["']en['"]>(.*?)<\/display-name\s*?>)/;
//        var chanRusTitleReg = /(?:<display-name.*?lang\s?=\s?["']ru['"]>(.*?)<\/display-name\s*?>)/;
//        var chanNoLangReg = /(?:<display-name\s*?>(.*?)<\/display-name\s*?>)/;
//        var chanIconReg = /(?:<icon.*?src=["'](.*)['"].*>)/;
//        var channelEndReg = /(?:<\/channel>)/;
//
//        var programmeReg = /<programme\s(?:start=["'](\d*)(?:\s(.*))?["'])\s(?:stop=["'](\d*)(?:\s(.*))?["'])\s(?:channel=["'](.*?)["'])>(?:<title.*?>(.*?)<\/title>)?/;
//        var titleReg = /<title.*?>(.*?)<\/title>/;
//        
//        $('#parsingListener').trigger('startEPGParsing');
//
//        dataArray = epgFile.split(/(\n|\r|\n\r|\r\n)/);
//
//        for (var i = 0; i < dataArray.length; i++) {
//            if (chanIDReg.exec(dataArray[i])) {
//                epgIDObject.id = chanIDReg.exec(dataArray[i])[1].trim();
//            }
//            if (chanEngTitleReg.exec(dataArray[i])) {
//                epgIDObject.eng = chanEngTitleReg.exec(dataArray[i])[1].trim();
//            }
//            if (chanRusTitleReg.exec(dataArray[i])) {
//                epgIDObject.rus = chanRusTitleReg.exec(dataArray[i])[1].trim();
//            }
//            if (chanNoLangReg.exec(dataArray[i])) {
//                epgIDObject.noName = chanNoLangReg.exec(dataArray[i])[1].trim();
//            }
//            if (chanIconReg.exec(dataArray[i])) {
//                epgIDObject.icon = chanIconReg.exec(dataArray[i])[1].trim();
//            }
//            if (channelEndReg.exec(dataArray[i])) {
//                if (epgIDObject.id.length > 0) {
//                    epgIDTemp.push(epgIDObject);
//                }
//                epgIDObject = {'id': '', 'eng': '', 'rus': '', 'noLang': '', 'icon': ''};
//            }
//
//            if (programmeReg.exec(dataArray[i])) {
//                epgProgrammeTemp.push(dataArray[i]);
//            }
//            if (titleReg.exec(dataArray[i]) && programmeReg.exec(epgProgrammeTemp[epgProgrammeTemp.length - 1])) {
//                epgProgrammeTemp[epgProgrammeTemp.length - 1] += dataArray[i];
//            }
////            $('#parsingListener').trigger('progressEPGParsing', [i + 1, dataArray.length]);
//        }
//       
//        for (var i = 0; i < epgIDTemp.length; i++) {
//            for (var n = 0; n < channelsContainer.length; n++) {
//                if (epgIDTemp[i].eng.toUpperCase() == channelsContainer[n].name.toUpperCase() ||
//                        epgIDTemp[i].rus.toUpperCase() == channelsContainer[n].name.toUpperCase() ||
//                        epgIDTemp[i].noLang.toUpperCase() == channelsContainer[n].name.toUpperCase()) {
//                    epgIDArray.push(epgIDTemp[i]);
//                    channelsContainer[n].tvgName = epgIDTemp[i].id;
//                }
//            }
////            $('#parsingListener').trigger('progressEPGParsing', [i + 1, epgIDTemp.length]);
//        }
//
//        for (var i = 0; i < epgProgrammeTemp.length; i++) {
//            var regResult = programmeReg.exec(epgProgrammeTemp[i]);
//            var inArray = false;
//            var tempTime;
//            var timeZone;
//            var startTime;
//            var endTime;
//            
////            $('#parsingListener').trigger('progressEPGParsing', [i + 1, epgProgrammeTemp.length]);
//            
//            if (regResult) {
//                if (!regResult[5]) {
//                    continue;
//                } else {
//                    for (var n = 0; n < epgIDArray.length; n++) {
//                        if (regResult[5] == epgIDArray[n].id) {
//                            inArray = true;
//                            break;
//                        }
//                    }
//                    if (!inArray) {
//                        continue;
//                    }
//                }
//
//                if (regResult[1]) {
//                    tempTime = String(regResult[1]);
//                    if (regResult[2]) {
//                        timeZone = String(regResult[2]);
//                        startTime = new Date(
//                                tempTime.substr(0, 4), //year
//                                parseInt(tempTime.substr(4, 2) - 1), //month
//                                tempTime.substr(6, 2), //date
//                                (parseInt(tempTime.substr(8, 2)) - parseInt(timeZone.substr(0, 3))), //hours
//                                (parseInt(tempTime.substr(10, 2)) - parseInt(timeZone.substr(0, 1) + timeZone.substr(3, 2)))     //minutes
//                                ).getTime();
//                    } else {
//                        startTime = new Date(
//                                tempTime.substr(0, 4), //year
//                                parseInt(tempTime.substr(4, 2) - 1), //month
//                                tempTime.substr(6, 2), //date
//                                tempTime.substr(8, 2), //hours
//                                tempTime.substr(10, 2)  //minutes
//                                ).getTime();
//                    }
//                }
//
//                if (regResult[3]) {
//                    tempTime = String(regResult[3]);
//                    if (regResult[4]) {
//                        timeZone = String(regResult[4]);
//                        endTime = new Date(
//                                tempTime.substr(0, 4), //year
//                                parseInt(tempTime.substr(4, 2) - 1), //month
//                                tempTime.substr(6, 2), //date
//                                (parseInt(tempTime.substr(8, 2)) - parseInt(timeZone.substr(0, 3))), //hours
//                                (parseInt(tempTime.substr(10, 2)) - parseInt(timeZone.substr(0, 1) + timeZone.substr(3, 2)))     //minutes
//                                ).getTime();
//                    } else {
//                        endTime = new Date(
//                                tempTime.substr(0, 4), //year
//                                parseInt(tempTime.substr(4, 2) - 1), //month
//                                tempTime.substr(6, 2), //date
//                                tempTime.substr(8, 2), //hours
//                                tempTime.substr(10, 2)  //minutes
//                                ).getTime();
//                    }
//                }
//
//                if (startTime && endTime) {
//                    var epgTemplate = new epgObject();
//                    epgTemplate.set(startTime / 1000, endTime / 1000, regResult[6], regResult[5]);
//                    epgProgrammeArray.push(epgTemplate);
//                }
//            }
//        }
//        
//        $('#parsingListener').trigger('endEPGParsing');
//        
////        console.log("End parsing file " + new Date().getTime() + ' ' + (new Date().getTime() - tempTime1));
//        return epgProgrammeArray;

        var epgIDTemp = [];
        var epgIDArray = [];
        var epgProgrammeArray = [];

        /** epgIDTemp creation (All channels from EPG file)*/
        $(epgFile).find("channel").each(
                function () {
                    var id = $(this).attr('id');
                    var rus = '';
                    var eng = '';
                    var noLang = '';
                    var icon = $(this).find("icon").attr("src");
                    $(this).find("display-name").each(
                            function () {
                                switch ($(this).attr('lang')) {
                                    case "ru":
                                        rus = $(this).text();
                                        break;
                                    case "en":
                                        eng = $(this).text();
                                        break;
                                    case undefined:
                                        noLang = $(this).text();
                                        break;
                                    default:
                                        break;
                                }
                            });
                    if (id && (rus || eng || noLang)) {
                        epgIDTemp.push({id: id, eng: eng, rus: rus, noLang: noLang, icon: icon});
                    }
                });

        /** epgIDArray creation (Only channels in channel list)*/
        for (var i = 0; i < epgIDTemp.length; i++) {
            for (var n = 0; n < channelsContainer.length; n++) {
                if (epgIDTemp[i].eng.toUpperCase() == channelsContainer[n].name.toUpperCase() ||
                        epgIDTemp[i].rus.toUpperCase() == channelsContainer[n].name.toUpperCase() ||
                        epgIDTemp[i].noLang.toUpperCase() == channelsContainer[n].name.toUpperCase()) {
                    epgIDArray.push(epgIDTemp[i]);
                    channelsContainer[n].tvgName = epgIDTemp[i].id;
                }
            }
        }

        /** epgProgrammeArray creation (Only programmes for channels in channel list)*/
        $(epgFile).find("programme").each(
                function () {
                    var checker;
                    var tempTime;
                    var startTime;
                    var endTime;
                    var timeZone;
                    var tvgName = $(this).attr("channel");
                    var title;
                    var ruTitle;
                    var engTitle;
                    var noLangTitle;

                    for (var i = 0; i < epgIDArray.length; i++) {
                        if (epgIDArray[i].id == tvgName) {
                            checker = true;
                            break;
                        }
                    }

                    if (!checker) {
                        return;
                    }

                    $(this).find("title").each(function () {
                        switch ($(this).attr('lang')) {
                            case 'ru':
                                ruTitle = $(this).text();
                                break;
                            case 'en':
                                engTitle = $(this).text();
                                break;
                            case undefined:
                                noLangTitle = $(this).text();
                                break;
                            default:
                                break;
                        }
                    });

                    if (ruTitle) {
                        title = ruTitle;
                    } else if (noLangTitle) {
                        title = noLangTitle;
                    } else if (engTitle) {
                        title = engTitle;
                    } else {
                        return;
                    }

                    tempTime = $(this).attr("start");
                    if (tempTime.length > 14) {
                        timeZone = tempTime.substr(15, 5);
                        startTime = new Date(
                                tempTime.substr(0, 4), //year
                                parseInt(tempTime.substr(4, 2) - 1), //month
                                tempTime.substr(6, 2), //date
                                (parseInt(tempTime.substr(8, 2)) - parseInt(timeZone.substr(0, 3))), //hours
                                (parseInt(tempTime.substr(10, 2)) - parseInt(timeZone.substr(0, 1) + timeZone.substr(3, 2)))     //minutes
                                ).getTime();
                    } else {
                        startTime = new Date(
                                tempTime.substr(0, 4), //year
                                parseInt(tempTime.substr(4, 2) - 1), //month
                                tempTime.substr(6, 2), //date
                                tempTime.substr(8, 2), //hours
                                tempTime.substr(10, 2)  //minutes
                                ).getTime();
                    }

                    tempTime = null;
                    timeZone = null;

                    tempTime = $(this).attr("stop");
                    if (tempTime.length > 14) {
                        timeZone = tempTime.substr(15, 5);
                        endTime = new Date(
                                tempTime.substr(0, 4), //year
                                parseInt(tempTime.substr(4, 2) - 1), //month
                                tempTime.substr(6, 2), //date
                                (parseInt(tempTime.substr(8, 2)) - parseInt(timeZone.substr(0, 3))), //hours
                                (parseInt(tempTime.substr(10, 2)) - parseInt(timeZone.substr(0, 1) + timeZone.substr(3, 2)))     //minutes
                                ).getTime();
                    } else {
                        endTime = new Date(
                                tempTime.substr(0, 4), //year
                                parseInt(tempTime.substr(4, 2) - 1), //month
                                tempTime.substr(6, 2), //date
                                tempTime.substr(8, 2), //hours
                                tempTime.substr(10, 2)  //minutes
                                ).getTime();
                    }

                    if (startTime && endTime && tvgName) {
                        var epgTemplate = new epgObject();
                        epgTemplate.set(startTime / 1000, endTime / 1000, tvgName, title);
                        epgProgrammeArray.push(epgTemplate);
                    }
                });

        console.log("End parsing file " + new Date().getTime() + ' ' + (new Date().getTime() - tempTime1));
        return epgProgrammeArray;
    };

    /** Returns all epg for selected channel
     * 
     * @param {Array} epgProgrammeArray -   array of epg programms
     * @param {Object} channelObj   -   channel for getting his epg
     * @returns {Array|M3UParser.EPGArrayParser.epgArray|Boolean}
     * 0 - empty array if no programms found
     * 1 - array of programms for selected channel
     * 2 - false if epgProgrammeArray or channelObj not set
     */
    this.EPGArrayParser = function (epgProgrammeArray, channelObj) {
        if (!epgProgrammeArray || !channelObj) {
            return false;
        }

        var epgArray = [];

        for (var i = 0; i < epgProgrammeArray.length; i++) {
            if (epgProgrammeArray[i].tvgName == channelObj.tvgName) {
                epgArray.push(epgProgrammeArray[i]);
            }
        }

        return epgArray;
    };

    /**  
     * @param {array} epgArray  -   array of programms for selected channel
     * @param {?number} amount  -   amount of programms would be returned
     * @returns {Array|M3UParser.ParseForToday.cleanArray|Boolean} -
     *  0 - Empty array if no programms found || 
     *  1 - Selected amount of programms that will be played including current
     *  or all programms for today from current playing if amount is not set
     *  2 - False if epgArray not set
     */
    this.ParseForToday = function (epgArray, amount) {
        function sorter(a, b) {
            return a.startTime - b.startTime;
        }

        var amountReg = /[0-9]+/;
        var counter = 0;
        var cleanArray = [];
        var now = new Date().getTime() / 1000;
        var today = new Date().setHours(0, 0, 0, 0);
        var tomorrow = new Date(today).setDate(new Date(today).getDate() + 1);
        var checker = false;

        if (!epgArray || typeof (epgObject) !== 'function') {
            return false;
        }

        if (epgArray.length > 0) {
            var sortedArray = epgArray.sort(sorter);

            for (var i = 0; i < sortedArray.length; i++) {
                if (amount && amountReg.exec(amount)) {
                    if (counter < amount) {
                        if ((sortedArray[i].startTime < now && sortedArray[i].endTime >= now) ||
                                (sortedArray[i].startTime) > now) {
                            cleanArray.push(sortedArray[i]);
                            counter++;
                        }
                    }
                } else {
                    if (((sortedArray[i].startTime < now && sortedArray[i].endTime >= now) ||
                            sortedArray[i].startTime > now) && sortedArray[i].startTime < tomorrow / 1000) {
                        cleanArray.push(sortedArray[i]);
                        counter++;
                    }
                }
            }

            if (cleanArray.length > 0) {
                for (var i = 0; i < cleanArray.length; i++) {
                    if (cleanArray[i].startTime < now && cleanArray[i].endTime >= now) {
                        checker = true;
                    }
                }

                if (checker === false) {
                    var epgTemplate = new epgObject();
                    epgTemplate.set(today / 1000, cleanArray[0].startTime, "Телепрограмма отсутствует", cleanArray[0].tvgName);
                    cleanArray.unshift(epgTemplate);
                    if (cleanArray.length > amount) {
                        cleanArray.pop();
                    }
                }
            }

        }
        return cleanArray;
    };

    /** 
     * @param {type} epgArray
     * @param {number} startTime  -   unixTimestamp, start of date
     * @param {number} endTime - unixTimestamp, end of date
     * @returns {Array|M3UParser.ParseWithDate.cleanArray|Boolean}
     * 0 - Empty array if no programms found 
     * 1 - Array of programms for selected time range
     * 2 - False if epgArray or time range not set
     */
    this.ParseWithDate = function (epgArray, startTime, endTime) {
        function sorter(a, b) {
            return a.startTime - b.startTime;
        }

        if (!epgArray || !startTime || !endTime || typeof (epgObject) !== 'function') {
            return false;
        }

        var cleanArray = [];

        if (epgArray.length > 0) {
            var sortedArray = epgArray.sort(sorter);
            for (var i = 0; i < sortedArray.length; i++) {
                if (sortedArray[i].startTime >= startTime && sortedArray[i].startTime < endTime) {
                    cleanArray.push(sortedArray[i]);
                }
            }
        }

        return cleanArray;
    };
}
;
