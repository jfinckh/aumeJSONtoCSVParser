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
                    case "assigned_tasks":
                        assigned_tasks( _.values(input[section][subSection]) );
                        break;
                    /*case "average_time_comment":
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
                        break;*/
                }
            });
		}
		values[section] = _.values(input[section]);
		if (values[section].length) {
			headings[section] = _.keys(values[section][0]);
		}
		
		// Prepare CSV content
		let content = headings[section].join(',');
		values[section].forEach((row) => {
			content += '\n';
			headings[section].forEach((heading, index) => {
				content += row[heading];
				if (index + 1 < headings[section].length) {
					content += ',';
				}
			});
		});
		
		// Store to file
		//fs.writeFileSync(`data-${section}.csv`, content);
		// console.log(`[SUCCESS]: Created data-${section}.csv`);
	});
} catch (e) {
	console.error(`[ERROR]: ${e.message}`);
	process.exit(1);
}

function assigned_tasks(data){
    let content = "id,displayName,email,name,numIssues\n";
    data.forEach((row) => {
        var timeMS = row["timestamp"]["time"]
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
    console.log(content);
    fs.writeFileSync(`assigned_tasks_history.csv`, content);
}

function average_time_comment(data){
    console.log("avg_time");
}

function commit_distance(data){
    console.log("com_distance");
}

function commit_length(data){
    console.log("comm_length");
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