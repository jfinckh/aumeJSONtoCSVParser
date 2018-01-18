#! /usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

// Need to specify location of JSON file
if (process.argv[2] === undefined) {
	console.error('[INFO]: Usage - aumeConverter <input>');
	process.exit(1);
}

// Need to be able to find and validate JSON file
let input = {};
try {
	input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
} catch (e) {
	console.error('[ERROR]: Could not read JSON export you specified');
	process.exit(1);
}

try {
	_.keys(input).forEach((section) => {
	    // Check if we are in the object metric_history
		if(section === "metric_history"){
		    // In metric_history run over the subObjects (assigned_tasks,...)
            _.keys(input[section]).forEach((subSection) => {
                // depending on the subSection evaluate in a different way
                switch(subSection){
                    case "assigned_tasks":
                        assigned_tasks( _.values(input[section][subSection]) );
                        break;
                    case "average_time_comment":
                        average_time_comment( _.values(input[section][subSection]) );
                        break;
                    case "commit_distance":
                        commit_distance( _.values(input[section][subSection]) );
                        break;
                    case "commit_length":
                        commit_length( _.values(input[section][subSection]) );
                        break;
                    case "commit_size":
                        commit_size( _.values(input[section][subSection]) );
                        break;
                    case "communication_miscalculation_effort":
                        communication_miscalculation_effort( _.values(input[section][subSection]) );
                        break;
                    case "correlation_jira_activity_push":
                        correlation_jira_activity_push( _.values(input[section][subSection]) );
                        break;
                    case "night_weekend_work_time":
                        night_weekend_work_time( _.values(input[section][subSection]) );
                        break;
                    case "open_sprint_issues":
                        open_sprint_issues( _.values(input[section][subSection]) );
                        break;
                    case "story_point_complexity":
                        story_point_complexity( _.values(input[section][subSection]) );
                        break;
                    case "time_since_last_commit":
                        time_since_last_commit( _.values(input[section][subSection]) );
                        break;
                }
            });
		} else if(section === "mood_history"){
            _.keys(input[section]).forEach(() => {
                moods_calc(_.values(input[section]));
            });

        }
	});
} catch (e) {
	console.error(`[ERROR]: ${e.message}`);
	process.exit(1);
}

/**
 * Calculates the Moodhistory by timeMS
 * @param data jsonData for metric_history mood_history
 * */
function moods_calc(data){
    let content= "date,mood,userId,value,timeSubmitted \n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        let singleValues = row["teamMood"]["singleValues"];
        singleValues.forEach((singleValues_row) => {
            let mood= singleValues_row["mood"] ? singleValues_row["mood"] : "";
            let userId = singleValues_row["userId"] ? singleValues_row["userId"] : "";
            let value = singleValues_row["value"] ? singleValues_row["value"] : "";
            let timeSubmitted = singleValues_row["timestamp"]["time"] ? singleValues_row["timestamp"]["time"] : 0;
            let dt = new Date(timeSubmitted);
            content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear() + " " + d.getHours() +":" + d.getMinutes() +
                ":" + d.getMilliseconds() + "," +
                mood + "," + userId + "," + value + "," + dt.getDay()+"."+(dt.getMonth()+1) + "." + dt.getFullYear() +
                " " + dt.getHours() +":" + dt.getMinutes() + ":" + dt.getMilliseconds()  + '\n';
        });
    });
    fs.writeFileSync(`moods_history.csv`, content);
}

/**
 * Calculates the assigned_tasks per user and timeMS and creates a csv called assigned_tasks_history.csv
 * @param data jsonData for metric_history assigned_tasks
 * */
function assigned_tasks(data){
    let content = "date,displayName,email,name,numIssues\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let issuesNum = 0;
                if(user["issues"]) {
                    issuesNum = user["issues"].length;
                }
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    user["displayName"] + "," + user["email"] + "," + user["name"] + "," + issuesNum + '\n';
            });
        }
    });
    fs.writeFileSync(`assigned_tasks_history.csv`, content);
}

/**
 * Calculates the average_time_comment per timeMS and creates a csv called average_time_comment_history.csv
 * @param data jsonData for metric_history average_time_comment
 * */
function average_time_comment(data){
    let content = "date,averageResponseTime,numberOfAnsweredQuestions,numberOfNotAnsweredQuestions,numberOfQuestions\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        let averageResponseTime = row["metric"]["averageResponseTime"] ? row["metric"]["averageResponseTime"] : 0;
        let numberOfAnsweredQuestions = row["metric"]["numberOfAnsweredQuestions"] ? row["metric"]["numberOfAnsweredQuestions"] : 0;
        let numberOfNotAnsweredQuestions = row["metric"]["numberOfNotAnsweredQuestions"] ?  row["metric"]["numberOfNotAnsweredQuestions"] : 0;
        let numberOfQuestions = row["metric"]["numberOfQuestions"]? row["metric"]["numberOfQuestions"] : 0;
        content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
            ":" + d.getMilliseconds() + "," +
            averageResponseTime + "," + numberOfAnsweredQuestions + "," + numberOfNotAnsweredQuestions + "," +
            numberOfQuestions + '\n';
    });
    fs.writeFileSync(`average_time_comment_history.csv`, content);
}

/**
 * Calculates the commit_distance per timeMs and user and creates a csv called commit_distance_history.csv
 * @param data jsonData for metric_history commit_distance
 * */
function commit_distance(data){
    let content = "date,averageMinuteDistance,commitCount,displayName,email\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let averageMinuteDistance = user["averageMinuteDistance"] ? user["averageMinuteDistance"] : 0;
                let commitCount = user["commitCount"] ? user["commitCount"]: 0;
                let displayName = user["displayName"] ? user["displayName"]: 0;
                let email = user["email"] ? user["email"]: 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    averageMinuteDistance + "," + commitCount + "," + displayName + "," + email + '\n';
            });
        }
    });
    fs.writeFileSync(`commit_distance_history.csv`, content);
}

/**
 * Calculates the commit_length per timeMs and User and creates a csv called commit_length_history.csv
 * @param data jsonData for metric_history commit_length
 * */
function commit_length(data){
    let content = "date,avgCommitLength,displayName,email\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let avgCommitLength = user["avgCommitLength"] ? user["avgCommitLength"]:0;
                let displayName = user["displayName"] ? user["displayName"]:0;
                let email = user["email"] ? user["email"]: 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    avgCommitLength + "," + displayName + "," + email +'\n';
            });
        }
    });
    fs.writeFileSync(`commit_length_history.csv`, content);
}

/**
 * Calculates the commit_size per timeMS and User and creates a csv called commit_size_history.csv
 * @param data jsonData for metric_history commit_size
 * */
function commit_size(data){
    let content = "date,additionsAverage,additionsSum,deletionsAverage,deletionsSum,displayName,email,totalAverage,totalSum\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let additionsAverage = user["additionsAverage"] ? user["additionsAverage"]:0;
                let additionsSum= user["additionsSum"] ? user["additionsSum"]:0;
                let deletionsAverage = user["deletionsAverage"] ? user["deletionsAverage"]: 0;
                let deletionsSum = user["deletionsSum"] ? user["deletionsSum"]: 0;
                let displayName = user["displayName"] ? user["displayName"]: 0;
                let email = user["email"] ? user["email"]: 0;
                let totalAverage = user["totalAverage"] ? user["totalAverage"]: 0;
                let totalSum = user["totalSum"] ? user["totalSum"]: 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    additionsAverage + "," + additionsSum + "," + deletionsAverage + ',' + deletionsSum +
                    "," + displayName + ',' + email + ',' + totalAverage + ',' + totalSum +'\n';
            });
        }
    });
    fs.writeFileSync(`commit_size_history.csv`, content);
}

/**
 * Calculates the communication_miscalculation_effort per timeMS  and creates a csv called communication_miscalculation_effort_history.csv
 * @param data jsonData for metric_history communication_miscalculation_effort
 * */
function communication_miscalculation_effort(data){
    let content = "date,communicationTime,communicationTimeInPercent,deltaEstimate,initialEstimate,issueKey,newTotalEstimate\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let logs = row["metric"]["logs"];
            logs.forEach((log) => {
                let communicationTime = log["communicationTime"] ? log["communicationTime"]:0;
                let communicationTimeInPercent = log["communicationTimeInPercent"] ? log["communicationTimeInPercent"]:0;
                let deltaEstimate = log["deltaEstimate"] ? log["deltaEstimate"] : 0;
                let initialEstimate = log["initialEstimate"] ? log["initialEstimate"] : 0;
                let issueKey = log["issue"]["key"] ? log["issue"]["key"] : "";
                let newTotalEstimate = log["newTotalEstimate"] ? log["newTotalEstimate"] : 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    communicationTime + "," + communicationTimeInPercent + "," + deltaEstimate + "," +
                    initialEstimate + "," + issueKey + "," + newTotalEstimate + '\n';
            });
        }
    });
    fs.writeFileSync(`communication_miscalculation_effort_history.csv`, content);
}

/**
 * Calculates the correlation_jira_activity_push per timeMS and users and creates a csv called correlation_jira_activity_push_history.csv
 * @param data jsonData for metric_history correlation_jira_activity_push
 * */
function correlation_jira_activity_push(data){
    let content = "date,lastUpdated,contentActivity,id,title,publishedTime\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        let lastUpdated = row["metric"]["lastUpdated"]["time"] ? row["metric"]["lastUpdated"]["time"]: "0";
        let dl = new Date(lastUpdated);
        if(row["metric"]){
            let activities = row["metric"]["activities"];
            if(activities){
                activities.forEach((activity => {
                    let contentActivity = activity["content"] ? activity["content"]: "";
                    let id = activity["id"] ? activity["id"]: "";
                    let title = activity["title"] ? activity["title"] : "";
                    let publishedTime = activity["published"]["time"] ? activity["published"]["time"] : 0;
                    content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                        ":" + d.getMilliseconds() + "," +
                        dl.getDay()+"."+(dl.getMonth()+1)+"."+dl.getFullYear()+ " " + dl.getHours() +":" + dl.getMinutes() +
                        ":" + dl.getMilliseconds() +
                        "," + contentActivity + "," + id + "," + title + "," + publishedTime + '\n';
                }));
            }
        }
    });
    fs.writeFileSync(`correlation_jira_activity_push_history.csv`, content);
}

/**
 * Calculates the night_weekend_work_time per timeMS and users and creates a csv called night_weekend_work_time_history.csv
 * @param data jsonData for metric_history night_weekend_work_time
 * */
function night_weekend_work_time(data){
    let content = "date,avgCommitLength,displayName,email\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let allWorkTimeMillis = user["allWorkTimeMillis"] ? user["allWorkTimeMillis"] : 0 ;
                let displayName = user["displayName"] ? user["displayName"]: 0;
                let email = user["email"] ? user["email"]: 0;
                let name = user["name"] ? user["name"]: 0;
                let nightWorkTimeMillis = user["nightWorkTimeMillis"] ? user["nightWorkTimeMillis"]: 0;
                let weekendWorkTimeMillis = user["weekendWorkTimeMillis"] ? user["weekendWorkTimeMillis"]: 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," +
                    allWorkTimeMillis + "," + displayName + "," + email + ',' +
                    name + ',' + nightWorkTimeMillis + ',' +  weekendWorkTimeMillis +  '\n';
            });
        }
    });
    fs.writeFileSync(`night_weekend_work_time_history.csv`, content);
}

/**
 * Calculates the open_sprint_issues per timeMS and users and creates a csv called open_sprint_issues_history.csv
 * @param data jsonData for metric_history open_sprint_issues
 * */
function open_sprint_issues(data){
    let content = "date,numIssues,estimatedTimeSum\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let openIssues = row["metric"]["openIssues"];
            let numIssues = openIssues.length;
            let estimatedTimeSum = 0;
            openIssues.forEach((issue) => {
                if(issue["estimatedTime"]){
                    estimatedTimeSum += parseInt(issue["estimatedTime"]);
                }
            });
            content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                ":" + d.getMilliseconds() + "," + numIssues + "," + estimatedTimeSum + '\n';
        }
    });
    fs.writeFileSync(`open_sprint_issues_history.csv`, content);
}

/**
 * Calculates the story_point_complexity per timeMS and creates a csv called story_point_complexity_history.csv
 * @param data jsonData for metric_history story_point_complexity
 * */
function story_point_complexity(data){
    let content = "date,points,storyCount\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let story_storyPoints = row["metric"]["storyPoints"];
            story_storyPoints.forEach((story) => {
                let points = story["points"] ? story["points"]:0;
                let storyCount = story["storyCount"] ? story["storyCount"]:0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," + points + "," + storyCount + '\n';
            });
        }
    });
    fs.writeFileSync(`story_point_complexity_history.csv`, content);
}

/**
 * Calculates the time_since_last_commit per timeMS and User and creates a csv called time_since_last_commit_history.csv
 * @param data jsonData for metric_history time_since_last_commit
 * */
function time_since_last_commit(data) {
    let content = "date,displayName,email,timeSinceLastCommit,timeLastCommit\n";
    data.forEach((row) => {
        let timeMS = row["timestamp"]["time"];
        let d = new Date(timeMS);
        if(row["metric"]){
            let users = row["metric"]["users"];
            users.forEach((user) => {
                let displayName = user["displayName"] ? user["displayName"] : 0;
                let email = user["email"] ? user["email"] : 0;
                let timeSinceLastCommit = user["timeSinceLastCommit"] ? user["timeSinceLastCommit"] : 0;
                let timeLastCommit = user["timestampLastCommit"]["time"] ? user["timestampLastCommit"]["time"] : 0;
                content += d.getDay()+ '.' + (d.getMonth()+1) + '.' + d.getFullYear()+ " " + d.getHours() +":" + d.getMinutes() +
                    ":" + d.getMilliseconds() + "," + displayName + "," + email + "," + timeSinceLastCommit + "," + timeLastCommit +'\n';
            });
        }
    });
    fs.writeFileSync(`time_since_last_commit_history.csv`, content);
}