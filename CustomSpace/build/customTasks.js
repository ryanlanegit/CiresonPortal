/*jslint nomen: true */
/*global custom, pageForm, require */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Task Builder
**/

require(['CustomSpace/Scripts/forms/taskBuilder'], function (taskBuilder) {
    console.log("taskBuilder", performance.now());
    console.log("taskBuilder pageForm", pageForm);
    taskBuilder.build(pageForm, function (view) {
        custom.utils.sortTaskList();
       //taskContainer.append(view);
    });
});