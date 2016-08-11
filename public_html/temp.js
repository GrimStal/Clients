/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */
var xmlFile;
var epgIDTemp = [];
var epgIDArray = [];
var epgProgrammeArray = [];
var request = new requestParams();

request.setRequest("GET", "http://192.168.56.1:280/xmltv.xml", function (data) {
    xmlFile = data
}, function (data) {
    console.log(data)
});
request.setCrossDomain(true);
request.setTimeout(10000);
request.setDataType("XML");
this._setAjaxRequest(request);

/** epgIDTemp creation (All channels from EPG file)*/
$(xmlFile).find("channel").each(
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
$(xmlFile).find("programme").each(
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
        
        