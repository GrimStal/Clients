/* 
 * Connecting to StalkerPortal library
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */
"use strict"

function epgObject() {
    this.startTime = null;      //unixtime
    this.endTime = null;        //unixtime
    this.title = null;
    this.tvgName = null;

    this.set = function (startTime, endTime, title, tvgName) {
        if (!startTime || !endTime || !title) {
            return false;
        }

        if (tvgName) {
            this.tvgName = tvgName;
        }

        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;

        return true;
    };
};
