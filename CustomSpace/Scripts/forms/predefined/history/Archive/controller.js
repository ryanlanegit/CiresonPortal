/**
history
**/

define(function (require) {
    var tpl = require("text!forms/predefined/history/view.html");


    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            var templateFrag = $(built(node));

            if (!_.isUndefined(pageForm.newWI)) { vm.set("HistoryButton", !pageForm.newWI); } //workitem
            if (!_.isUndefined(pageForm.isNew)) { vm.set("HistoryButton", !pageForm.isNew); } //AM 

            vm.view.loadHistory = function () {

                //hide button *before* history loads
                //originally the button was hidden after a successful load of the history,
                //but that allowed the user to repeatedly mash the button, causing
                //multiple instances of the history to load
                vm.set("HistoryButton", false);
                //this DOM element will be needed again later, so store it in a variable
                //to prevent unneccessary scans of the DOM
                var $historyView = $("#historyView");

                //is there a proper kendo way to do this?
                $historyView.children().remove();

                //kendo.ui.progress(templateFrag, true);
                $.ajax({
                    url: "/Search/GetObjectHistory",
                    data: { id: vm.BaseId },
                    type: "GET",
                    cache: false,
                }).done(function (data, textStatus, jqXHR) {
                    //build a view model
                    var historyModel = kendo.observable({
                        nodes: data
                    });

                    //create then render the new view
                    var htmlTemplate = '<ul class="timeline" data-template="propertyHistoryTemplate" data-bind="source: nodes"></ul>';
                    var settings = {
                        model: historyModel,
                        wrap: false,
                        init: $.noop //empty function
                    };
                    var history = new kendo.View(htmlTemplate, settings);
                    history.render($historyView);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    //should we alert the user?
                    //at least log the error
                    console.log(textStatus + ":", errorThrown);
                }).always(function () {
                    //show the button
                    vm.set("HistoryButton", true);
                });
            }

            callback(templateFrag);
        }
    }

    return definition;

});