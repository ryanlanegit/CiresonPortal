require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        text: "require/text"
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

require(["/CustomSpace/Scripts/forms/profileMain-built.min.js"], function() {
    console.log("profileMainBuilder-built", (performance.now()));
    console.log("profileMainBuilder-built profileMainBuilder", profileMainBuilder);
    app.lib.mask.remove();
    $("body").css("cursor", "auto");
});
