/**
Send To Jira
**/

define(function (require) {
    var anchorTemplate = require('text!forms/tasks/anchor/view.html'),
        sendToJiraTemplate = require('text!CustomSpace/Scripts/forms/tasks/sendToJira/view.html'),
        
        sendToJiraTask = {
            Task: 'sendToJira',
            Type: pageForm.type,
            Label: 'Send To Jira',
            Access: session.user.Analyst && (pageForm.type === 'Incident' || pageForm.type === 'Service Request'),
            Configs: {
            }
        };
    
    var definition = {
        task: sendToJiraTask,
        build: function build (vm, node, callback) {
            if (custom.debug)
                console.log('Build', 'Send To Jira');
            /* BEGIN Functions */
            var getFormTaskViewModel = function getFormTaskViewModel (modalEle) {
                var taskVm = new kendo.observable({ 
                    sendToJira: function sendToJira () {
                        var modalWindowEle = modalEle.element.clone();
                        
                        var modalWindowControl = modalWindowEle.kendoCiresonWindow({
                            title: node.Label,
                            resizable: true,
                            modal: true,
                            viewable: false,
                            width: 500,
                            height: 400,
                            close: function close () {},
                            activate: function activate () {
                                //on window activate bind the view model to the loaded template content
                                onModalActivate(modalWindowViewModel, modalWindowEle);
                            }
                        }).data('kendoWindow');
                        
                        var modalWindowViewModel = kendo.observable({
                            okEnabled: false,
                            okClick: function okClick () {
                                performSendToJira();
                                
                                modalWindowControl.close();
                            },
                            cancelClick: function cancelClick () {
                                modalWindowControl.close();
                            }
                        });
                        
                        kendo.bind(modalWindowEle, modalWindowViewModel);

                        modalWindowEle.removeClass('hide');
                        modalWindowEle.show();
                        modalWindowControl.open();
                    }
                });
                
                return taskVm;
            };
            
            // Send To Jira
            var performSendToJira = function processsendToJira () {
                var win = window.open('https://jira.sanmar.com/secure/CreateIssue!default.jspa', '_blank');
                win.focus();
                // Resolved Popup Notification
                sendToJiraPopupNotification();
            };

            var sendToJiraPopupNotification = function resolvedPopupNotification () {
                String.Format = function (b) {
                    var a = arguments;
                    return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
                        if (b.substring(0, 2) == '{{') return b;
                        var c = parseInt(b.match(/\d/)[0]);
                        return a[c + 1]
                    })
                };

                var messageContent = '{0} sent to Jira message.<br/>WIP.',
                    popupNotification = $('.popupNotification').getKendoNotification('kendoNotification');

                if (popupNotification == null) {
                    popupNotification = $('.popupNotification').kendoNotification({
                        templates: [{
                            type: 'info',
                            template: '<div class="success k-ext-dialog-content"><div class="k-ext-dialog-icon fa fa-check"></div><div class="k-ext-dialog-message">#= message #</div></div>'
                        }]
                    }).data('kendoNotification');
                } else {
                    popupNotification.hide()
                }

                popupNotification.show({
                    message: String.Format(messageContent, pageForm.viewModel.Id)
                }, 'info');
            };
            
            //executes on resolution category dropdown change
            var onModalUpdate = function onModalUpdate (modalWindowViewModel, modalWindowEle) {
                if ( true
                ) {
                    modalWindowViewModel.set('okEnabled', true);
                } else {
                    modalWindowViewModel.set('okEnabled', false);
                }
            };
            
            //executes when modal dialog is opening
            var onModalActivate = function onModalActivate (modalWindowViewModel, modalWindowEle) {
                onModalUpdate(modalWindowViewModel, modalWindowEle);
            };
            
            //template .build() and view.renderererers.
            var buildAndRender = {
                windowEle: function (windowTemplate) {
                    //build the template for the window
                    var builtModal = _.template(windowTemplate),
                        ele = new kendo.View(builtModal(), { wrap: false });
                    //send hidden window back to caller (appended in the callback)
                    callback(ele.render());
                    return ele;
                },
                taskListItem: function (properties, anchorViewModel, template) {
                    $.extend(true, properties, node);
                    //build the anchor and bind viewModel to it
                    var builtAnchor = _.template(template),
                        anchorElm = new kendo.View(builtAnchor(properties), {
                        wrap: false, model: anchorViewModel
                    });
                    //send anchor element back to caller (appended in the callback)
                    callback(anchorElm.render());
                    return anchorElm;
                }
            }
            /* END functions */

            /* Initialization code */
            var initFormTask = function initFormTask() {
                var modalEle = buildAndRender.windowEle(sendToJiraTemplate),
                    formTaskViewModel = getFormTaskViewModel(modalEle),
                    anchorTemplateProps = { Target: node.Task };
                buildAndRender.taskListItem(anchorTemplateProps, formTaskViewModel, anchorTemplate);
            };

            initFormTask();
        }
    }

    return definition;

});