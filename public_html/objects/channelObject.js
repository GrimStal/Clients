/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

"use strict";

function channelObject() {
    this.name = null;
    this.URL = null;
    this.channelID = null;
    this.image = null;
    this.tvgName = null;
    this.groupTitle = null;
    this.favorite = 0;

    this.set = function (name, url, channelID, image, tvgName, groupTitle, favorite) {
        if (name) {
            this.name = name;
        }
        if (url) {
            this.URL = url;
        }
        if (channelID) {
            this.channelID = channelID;
        }
        if (image) {
            this.image = image;
        }
        if (tvgName) {
            this.tvgName = tvgName;
        }
        if (groupTitle) {
            this.groupTitle = groupTitle;
        }
        if (favorite) {
            this.favorite = favorite;
        }

        return true;
    };
    
    this.clear = function (){		
    	this.name = null;		
        this.URL = null;		
        this.channelID = null;		
        this.image = null;		
        this.tvgName = null;		
        this.groupTitle = null;		
        this.favorite = 0;		
    };
};
