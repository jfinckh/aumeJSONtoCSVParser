#! /usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

module.exports = {
    jira: function (input) {
        let headings = "";
        let content = "";

        let numDailys = 0;
        let avgTimeDaily = 0;

        // Calc heeading
        _.keys(input[0]).forEach((head) => headings += head + ",");

        //calc sections
        _.keys(input).forEach((section) => {
            let id = input[section]["id"] ? input[section]["id"] : "";
            let title = input[section]["title"] ? input[section]["title"] : "";
            let content2 = input[section]["content"] ? input[section]["content"] : "";
            let timeStamp = input[section]["timestamp"] ? input[section]["timestamp"] : 0;
            let d = new Date(timeStamp);
            let name = input[section]["author"]["name"] ? input[section]["author"]["name"] : "";
            let emailAdress = input[section]["author"]["emailAddress"] ? input[section]["author"]["emailAddress"] : "";
            let avatarURLs = input[section]["author"]["avatarUrls"] ? input[section]["author"]["avatarUrls"] : "";
            let displayName = input[section]["author"]["displayName"] ? input[section]["author"]["displayName"] : "";

            // calc dailystuff
            if(content2.includes("daily") || content2.includes("Daily")){
                numDailys++;
                var loggedTimeString=title.substring(title.indexOf("'")+1,title.lastIndexOf("'"));
                var loggedTimeNum = loggedTimeString.match(/\d+/)[0];
                avgTimeDaily += parseInt(loggedTimeNum);
            }

            content += id + "," + title + "," + content2 + "," + (d.getDay()+1) + '.' +
                (d.getMonth() + 1) + '.' + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() +
                ":" + d.getMilliseconds()  + "," + name + "," + emailAdress + "," +
                avatarURLs + "," + displayName + "\n";
        });
        let csv = headings + "\n" + content;


        // Calc AVG of the time of all Dailys
        avgTimeDaily /= numDailys;
        console.log(Math.round(avgTimeDaily));

        // Store to file
        fs.writeFileSync(`jira_metric_history.csv`, csv);
    }
};