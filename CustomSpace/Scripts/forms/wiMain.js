// REDIRECTED
require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        'text': "require/text",
        'CustomSpace': '../CustomSpace'
    },

    shim: {
        //kendo: {
        //    deps: ['jquery'],
        //    exports: 'kendo'
        //}
    }
});

//let's let the user know that things are happening
//app.lib.mask.apply();
$("body").css("cursor", "wait");
//$(document).ajaxStop(function () {
//    $("body").css("cursor", "auto");
//});

require(["/CustomSpace/Scripts/forms/wiMain-built.min.js"], function(data) {
    console.log("wiMainBuilder-built", (performance.now()));
    console.log("wiMainBuilder-built arguments", arguments);
    console.log("wiMainBuilder-built data", data);
    console.log("wiMainBuilder-built wiMainbuilder", wiMainBuilder);
    app.lib.mask.remove();
    $("body").css("cursor", "auto");
});