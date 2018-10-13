//REDIRECTED
require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        text: "require/text",
        'angular': 'libs/angular/angular',
        'angularAMD': 'libs/angular/angularAMD',
        'angular-ui-router': 'libs/angular/angular-ui-router',
        'angular-sanitize': 'libs/angular/angular-sanitize',
        'angular-resource': 'libs/angular/angular-resource'
    },

    shim: {
        'angular': { exports: "angular" },
        'angular-ui-router': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular']
    }
});

require(["/CustomSpace/Scripts/viewMain-built.min.js"], function(data) {
    console.log("viewMainBuilder-built", (performance.now()));
    console.log("viewMainBuilder-built arguments", arguments);
    console.log("viewMainBuilder-built data", data);
    console.log("viewMainBuilder-built viewMainBuilder", viewMainBuilder);
});