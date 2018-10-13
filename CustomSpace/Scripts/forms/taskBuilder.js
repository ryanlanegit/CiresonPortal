/*jslint nomen: true */
/*global $, console, custom, define, pageForm */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Task Builder
**/

define([
    'CustomSpace/Scripts/forms/tasks/resolveIncident/controller',
    //'/CustomSpace/Scripts/forms/tasks/sendEmail/controller.js',
    'CustomSpace/Scripts/forms/tasks/sendToJira/controller'
], function () {
    var taskModules = arguments,
        definition = {
            build: function (vm, callback) {
                var ulElement = $('.taskmenu'),
                    taskCallback = function (view) {
                        ulElement.append(view);
                    };

                if (custom.debug) {
                    console.log('Build', 'taskBuilder');
                }

                $.each(taskModules, function (i, taskModule) {
                    pageForm.taskTemplate.tasks.push(taskModule.task);
                    if (taskModule.task.Access && taskModule.task.Type.includes(pageForm.type)) {
                        taskModule.build(vm, taskModule.task, function (view) {
                            taskCallback(view);
                        });
                    }
                });

                //send back <ul> with <li> of each task
                callback(ulElement);
            }
        };

    return definition;
});