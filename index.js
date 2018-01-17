#! /usr/bin/env node

const fs = require('fs');
const _ = require('lodash');

// Need to specify location of JSON file
if (process.argv[2] === undefined) {
	console.error('[INFO]: Usage - ftc <input>');
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

let values = {};
let headings = {};
try {
	_.keys(input).forEach((section) => {
	    // Check if we are in the object metric_history
		if(section === "metric_history"){
		    // In metric_history run over the subObjects (assigned_tasks,...)
            _.keys(input[section]).forEach((subSection) => {
                // depending on the subSection evaluate in a different way
                switch(subSection){
                    /*case "assigned_tasks":
                        assigned_tasks( _.values(input[section][subSection]) );
                        break;
                    case "average_time_comment":
                        average_time_comment( _.values(input[section][subSection]) );
                        break;
                    case "commit_distance":
                        commit_distance( _.values(input[section][subSection]) );
                        break;*/
                    case "commit_length":
                        commit_length( _.values(input[section][subSection]) );
                        break;
                    /*case "commit_size":
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
                        break;*/
                }
            });
		}
	});
} catch (e) {
	console.error(`[ERROR]: ${e.message}`);
	process.exit(1);
}

/**
 * Calculates the assigned_tasks per user and timeMS and creates a csv called assigned_tasks_history.csv
 * @param data jsonData for metric_history assigned_tasks
 * */
function assigned_tasks(data){
    let content = "timeMS,displayName,email,name,numIssues\n";
    data.forEach((row) => {
        var timeMS = row["timestamp"]["time"];
        if(row["metric"]){
            var users = row["metric"]["users"];
            users.forEach((user) => {
                var issuesNum = 0;
                if(user["issues"]) {
                    issuesNum = user["issues"].length;
                }
                content += timeMS + "," + user["displayName"] + "," + user["email"] + "," + user["name"] + "," + issuesNum + '\n';
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
    let content = "timeMS,averageResponseTime,numberOfAnsweredQuestions,numberOfNotAnsweredQuestions,numberOfQuestions\n";
    data.forEach((row) => {
        var timeMS = row["timestamp"]["time"];
        var averageResponseTime = row["metric"]["averageResponseTime"] ? row["metric"]["averageResponseTime"] : 0;
        var numberOfAnsweredQuestions = row["metric"]["numberOfAnsweredQuestions"] ? row["metric"]["numberOfAnsweredQuestions"] : 0;
        var numberOfNotAnsweredQuestions = row["metric"]["numberOfNotAnsweredQuestions"] ?  row["metric"]["numberOfNotAnsweredQuestions"] : 0;
        var numberOfQuestions = row["metric"]["numberOfQuestions"]? row["metric"]["numberOfQuestions"] : 0;
        content += timeMS + "," + averageResponseTime + "," + numberOfAnsweredQuestions + "," + numberOfNotAnsweredQuestions + "," + numberOfQuestions + '\n';
    });
    fs.writeFileSync(`average_time_comment_history.csv`, content);
}

/**
 * Calculates the commit_distance per timeMs and user and creates a csv called commit_distance_history.csv
 * @param data jsonData for metric_history commit_distance
 * */
function commit_distance(data){
    let content = "timeMS,averageMinuteDistance,commitCount,displayName,email\n";
    data.forEach((row) => {
        var timeMS = row["timestamp"]["time"];
        if(row["metric"]){
            var users = row["metric"]["users"];
            users.forEach((user) => {
                var averageMinuteDistance = user["averageMinuteDistance"] ? user["averageMinuteDistance"] : 0;
                var commitCount = user["commitCount"] ? user["commitCount"]: 0;
                var displayName = user["displayName"] ? user["displayName"]: 0;
                var email = user["email"] ? user["email"]: 0;
                content += timeMS + "," + averageMinuteDistance + "," + commitCount + "," + displayName + "," + email + '\n';
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
    let content = "timeMS,avgCommitLength,displayName,email\n";
    data.forEach((row) => {
        var timeMS = row["timestamp"]["time"];
        if(row["metric"]){
            var users = row["metric"]["users"];
            users.forEach((user) => {
                var avgCommitLength = user["avgCommitLength"] ? user["avgCommitLength"]:0;
                var displayName = user["displayName"] ? user["displayName"]:0;
                var email = user["email"] ? user["email"]: 0;
                content += timeMS + "," + avgCommitLength + "," + displayName + "," + email +'\n';
            });
        }
    });
    fs.writeFileSync(`commit_length_history.csv`, content);
}

function commit_size(data){
    console.log("comm_size");
}

function communication_miscalculation_effort(data){
    console.log("communi_miscalcu");
}

function correlation_jira_activity_push(data){
    console.log("corr_jira_act");
}

function night_weekend_work_time(data){
    console.log("night_weekendWork");
}

function open_sprint_issues(data){
    console.log("opensprintissues");
}

function story_point_complexity(data){
    console.log("storypointcomplex");
}

function time_since_last_commit(data) {
    console.log("timesincelastcommit");
}