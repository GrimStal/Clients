/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

function StalkerParser() {

    this._api_v2_url = "http://v2.api.ott.briz.ua";

    /* response - response from stalker server */
    this.GenresArrayParser = function (response) {
        var genres = response;

        for (var i = 0; i < genres.length; i++) {
            if (!genres[i].id || !genres[i].title){
                genres.splice(i,1);
                i--;
                continue;
            }
            
            switch (genres[i].id.toLowerCase()) {
                case 'news':
                    genres[i].title = 'Новостные';
                    break;
                case 'movies':
                    genres[i].title = 'Фильмовые';
                    break;
                case 'shows':
                    genres[i].title = 'Развлекательные';
                    break;
                case 'educations':
                    genres[i].title = 'Познавательные';
                    break;
                case 'sports':
                    genres[i].title = 'Спортивные';
                    break;
                case 'childrens':
                    genres[i].title = 'Детские';
                    break;
                case 'musics':
                    genres[i].title = 'Музыкальные';
                    break;
                case 'hdtv':
                    genres[i].title = 'HDTV';
                    break;
                case 'russia':
                    genres[i].title = 'Зарубежные';
                    break;
                case 'ukraine':
                    genres[i].title = 'Украинские';
                    break;
                case 'odessa':
                    genres[i].title = 'Одесские';
                    break;
                case 'specials':
                    genres[i].title = 'Опциональные';
                    break;
                default:
                    break;
            }
        }

        genres.unshift({id: '', title: 'Все каналы'});
        genres.push({id: 'favorite', title: 'Избранное'});

        return genres;
    };

    this.ChannelsArrayParser = function (data) {

        if (typeof (channelObject) !== 'function') {
            return false;
        }

        var channelsContainer = [];
        var name = null;
        var channelID = null;
        var URL = null;
        var image = null;
        var tvgName = null;
        var groupTitle = null;
        var favorite = null;

        if (data.length !== 0) {
            for (var i = 0; i < data.length; i++) {

                name = (data[i].name) ? data[i].name : false;
                channelID = (data[i].id) ? data[i].id : false;
                URL = (data[i].url) ? data[i].url : false;
                image = (data[i].logo) ? this._api_v2_url + data[i].logo : false;
//                tvgName = (data[i].xmltv_id) ? data[i].xmltv_id : false;          //for Pavlov V. epg server
                tvgName = (data[i].id) ? data[i].id : false;                        //for stalker epg server
                groupTitle = (data[i].genre_id) ? data[i].genre_id : false;
                favorite = (data[i].favorite) ? data[i].favorite : 0;

                if (name && channelID) {
                    var channel = new channelObject();
                    channel.set(name, URL, channelID, image, tvgName, groupTitle, favorite);
                    channelsContainer.push(channel);
                }
            }
        } else {
            var channel = new channelObject();
            channel.set("ПУСТО", '0', false, false, '-', false);
            channelsContainer.push(channel);
        }

        return channelsContainer;
    };

    this.EPGArrayParser = function (data, tvgName) {
        if (!data || typeof (epgObject) !== 'function') {
            return false;
        }

        var epgArray = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].start && data[i].end && data[i].name) {
                var epgTemplate = new epgObject();
                epgTemplate.set(data[i].start, data[i].end, data[i].name, tvgName);
                epgArray.push(epgTemplate);
            }
        }

        return epgArray;
    }

    this.ParseForToday = function () {
        return false;
    };

    this.ParseWithDate = function () {
        return false;
    };

    this.epgFileParser = function () {
        return false;
    }
}
