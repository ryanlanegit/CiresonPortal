/*jslint nomen: true */
/*global _, $, app, console, custom, define, kendo, pageForm, session */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Send Email
**/

define(function (require) {
    var anchorTemplate = require("text!forms/tasks/anchor/view.html"),
        sendEmailTemplate = require("text!CustomSpace/Scripts/forms/tasks/sendEmail/view.html"),

        sendEmailTask = {
            Task: 'sendEmail',
            Type: 'Incident',
            Label: 'Send Email V2',
            Access: session.user.Analyst === 1,
            Configs: {
                ResolutionCategory: {
                    Id: 'c5f6ada9-a0df-01d6-7087-6b8500ca6c2b',
                    Name: 'Fixed by analyst'
                },
                description: {
                    MinLength: 4,
                    MaxLength: 4000,
                    Rows: 4
                }
            }
        },

        definition = {
            template: sendEmailTemplate,
            task: sendEmailTask,
            build: function (vm, node, callback) {
                if (custom.debug) {
                    console.log('Build', 'Send Email V2');
                }
                /* BEGIN Functions */
                var getFormTaskViewModel = function getFormTaskViewModel(modalEle) {
                    var taskVm = new kendo.observable({
                        sendEmail: function resolveIncident() {
                            var modalWindowEle = modalEle.element.clone(),
                                modalWindowControl = modalWindowEle.kendoCiresonWindow({
                                    title: node.Label,
                                    resizable: true,
                                    modal: true,
                                    viewable: false,
                                    width: 500,
                                    height: 400,
                                    close: function close() {},
                                    activate: function activate() {
                                        //on window activate bind the view model to the loaded template content
                                        //onModalActivate(modalWindowViewModel, modalWindowEle);
                                    }
                                }).data('kendoWindow'),

                                modalWindowViewModel = kendo.observable({
                                    okEnabled: false,
                                    okClick: function okClick() {
                                        performResolveIncident(
                                            modalWindowViewModel.ResolutionCategory.Id,
                                            modalWindowViewModel.ResolutionDescription.ResolutionDescription
                                        );

                                        modalWindowControl.close();
                                    },
                                    cancelClick: function cancelClick() {
                                        modalWindowControl.close();
                                    }
                                });

                            kendo.bind(modalWindowEle, modalWindowViewModel);
                            /*
                            createIncidentResolutionFields(modalWindowViewModel, modalWindowEle);

                            var resolutionCategoryDropDownTreeViewControl = modalWindowEle.find('div[data-role="ResolutionCategory"]').data('kendoExtDropDownTreeViewV3'),
                                resolutionCategoryDropDownControl = modalWindowEle.find('div[data-role="ResolutionCategory"]').data().handler._dropdown,
                                resolutionCategoryTreeViewControl = modalWindowEle.find('div[data-role="ResolutionCategory"]').data().handler._treeview;

                            resolutionCategoryDropDownControl.input.keyup(function () {
                                onModalUpdate(modalWindowViewModel, modalWindowEle);
                            });

                            resolutionCategoryDropDownTreeViewControl.bind('change', function () {
                                onModalUpdate(modalWindowViewModel, modalWindowEle);
                            });

                            resolutionCategoryDropDownControl.bind('change', function () {
                                onModalUpdate(modalWindowViewModel, modalWindowEle);
                            });

                            resolutionCategoryTreeViewControl.bind('change', function () {
                                onModalUpdate(modalWindowViewModel, modalWindowEle);
                            });*/

                            modalWindowEle.removeClass('hide');
                            modalWindowEle.show();
                            modalWindowControl.open().maximize();
                        }
                    });

                    return taskVm;
                };
                
                /*
                //build the template for the window
                var built = _.template(sendEmailTemplate);
                var view = new kendo.View(built(properties), { wrap: false });

                //add in hidden window
                callback(view.render());
                view.destroy();//there is some issue with the cloned element if we don't destroy the view
                //this view Model is bound to the anchor element 
                var viewModel = kendo.observable({
                    sendEmail: function () {
                        var cont = view.element; //we have the element in memory so no need use a selector
                        win = cont.kendoCiresonWindow({
                            title: localization.SendEmail,
                            width: 650,
                            height: 740,
                            actions: [],
                            activate: function () {
                                getAffectedUserEmail(_vmWindow);
                            }
                        }).data("kendoWindow");

                        //this view Model is bound to the window element
                        var _vmWindow = new kendo.observable({
                            emailTo: "",
                            emailCC: "",
                            emailSubject: "[" + vm.viewModel.Id + "] " + vm.viewModel.Title,
                            emailHTMLMessage: "",
                            emailTextMessage:"",
                            emailAttachment: "",
                            emailTemplateDataSource: tempateDataSource,
                            emailTemplateValue: "",
                            attachmentErrorMessage: "",
                            addToLog: false,
                            okEnabled: true,
                            okClick: function () {
                                //validate email addresses first
                                if ((this.emailTo == null || this.emailTo == "") &&
                                    (this.emailCC == null || this.emailCC == "")) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.InvalidEmailAddress,
                                        message: localization.PleaseProvideEmailAddress
                                    });
                                    return;
                                }
                                else {
                                    var arrEmail = _.union(this.emailTo.split(";"), this.emailCC.split(";"));
                                    var invalidEmailAdress = validateEmailAddress(arrEmail);
                                    if (invalidEmailAdress != null) {
                                        kendo.ui.ExtAlertDialog.show({
                                            title: localization.InvalidEmailAddress,
                                            message: localization.InvalidEmailAddressMessage.replace("{0}", invalidEmailAdress)
                                        });
                                        return;
                                    }
                                }

                                //if we are adding to action log we require there to be message content
                                if (this.addToLog) {
                                    var editor = cont.find("#messageEditor").data("kendoEditor");
                                    this.set("emailTextMessage", editor.body.innerText || editor.body.textContent);

                                    var trimmedMessage = (this.emailTextMessage && _.isString(this.emailTextMessage)) ? this.emailTextMessage.trim() : "";

                                    if (trimmedMessage.length <= 0) {
                                        kendo.ui.ExtAlertDialog.show({
                                            title: localization.MessageRequired,
                                            message: localization.MessageRequiredWhenAddingLogEntry
                                        });
                                        return;
                                    }
                                }

                                //send email
                                kendo.ui.progress($(".k-window"), true);
                                sendEmail(this);

                            },
                            cancelClick: function () {
                                win.close();
                            },
                            emailTemplateChange: function (e) {
                                var filter = {
                                    field: "Id",
                                    operator: "eq",
                                    value: e.sender._old //_old stores the selected value's id
                                };
                                tempateDataSource.filter(filter);

                                var dView = tempateDataSource.view();
                                var subject = (dView.length > 0) ? "[" + vm.viewModel.Id + "] " + dView[0].Subject : "[" + vm.viewModel.Id + "] " + vm.viewModel.Title;
                                var content = (dView.length > 0) ? dView[0].Content : "";

                                content = cont.find("#messageEditor").html(content).text();

                                //change new line (\n) to line break (<br>) on non-html template only
                                if (!content.match(/<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/)) {
                                    content = cont.find("#messageEditor").html(content).text().replace(/\r\n|\r|\n/g, "<br />");
                                }

                                this.set("emailSubject", subject);
                                this.set("emailHTMLMessage", content);

                                tempateDataSource.filter({});
                            },
                            showChangeStatus: (vm.type === "Incident"),
                            changeStatus: false,
                            sendEmailAttachment: null,
                            setFirstResponseDate: (_.isNull(vm.viewModel.FirstResponseDate)) ? true : false,
                            enableFirstResponseDate: (_.isNull(vm.viewModel.FirstResponseDate)) ? true : false,
                        });

                        //add control to the window
                        kendo.bind(cont, _vmWindow);

                        //init uploader
                        initializeUploader(cont, _vmWindow);

                        //init editor
                        buildEditor(cont.find("#messageEditor"), _vmWindow);

                        cont.removeClass('hide');
                        cont.show();

                        win.open();
                    }
                });

                //build the anchor and bind viewModel to it
                var link = _.template(anchorTemplate);
                //make sure we have all the node set
                var properties = {
                    Target: "sendEmail"
                };
                $.extend(true, properties, node);
                //add in anchor
                var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
                callback(anchorElm.render());

                //more functions
                var tempateDataSource = new kendo.data.DataSource({
                    transport: {
                        read: "/EmailNotification/GetNotificationTemplates",
                        dataType: "json"
                    },
                    schema: {
                        model: {
                            fields: {
                                Id: { type: "string" },
                                Name: { type: "string" }
                            }
                        }
                    }
                });

                var addToCommentLog = function (commentMessage) {
                    var newActionLog = {
                        EnteredBy: session.user.Name,
                        Title: localization.EMailSent,
                        IsPrivate: false,
                        EnteredDate: new Date().toISOString(),
                        LastModified: new Date().toISOString(),
                        Description: commentMessage,
                        DescriptionDisplay: commentMessage,
                        Image: app.config.iconPath + app.config.icons["E-Mail Sent"], 
                        ActionType: {
                            Id: "15e86d4a-1b55-01be-C9fa-660a3cb3fc26",
                            Name: "Email Sent"
                        }
                        //ActionType: { Id: "15E86D4A-1B55-01BE-C9FA-660A3CB3FC26", Name: "E-Mail Sent" }
                    }
                    if (!vm.viewModel.ActionLog) {
                        vm.viewModel.ActionLog = [];
                    }

                    var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                    if (actionLogType) {
                        vm.viewModel[actionLogType].push(newActionLog);
                    }
                }

                var saveFailure = function (exceptionMessage) {
                    if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                        app.lib.message.add(exceptionMessage, "danger");
                    } else {
                        //fallback to generic message
                        app.lib.message.add(localization.PleaseCorrectErrors, "danger");
                    }
                    app.lib.message.show();
                }

                var getAffectedUserEmail = function (_vmWindow) {
                    var affectedUserId = (vm.viewModel.RequestedWorkItem) ? vm.viewModel.RequestedWorkItem.BaseId : "";
                    $.ajax({
                        url: "/EmailNotification/GetffectedUserEmail",
                        type: "GET",
                        data: { baseId: affectedUserId },
                        success: function (data, textStatus, jqXHR) {
                            _vmWindow.set("emailTo", data);
                        }
                    }); 
                }

                var validateEmailAddress = function (arrEmail) {
                    var invalidEmailAddress = null;
                    for (var i in arrEmail) {
                        var email = arrEmail[i].trim();
                        if (email == "") continue;
                        if (app.validateEmail(email) == false) {
                            invalidEmailAddress = email;
                            break;
                        }
                    }
                    return invalidEmailAddress;
                }

                var initializeUploader = function (cont, _vmWindow) {
                    cont.find("#fileUploader").kendoUpload({
                        async: {
                            saveUrl: "/FileAttachment/UploadAttachment/" + vm.viewModel.BaseId + "?className=" + vm.viewModel.ClassName + "&count=" + vm.viewModel.FileAttachment.length,
                            autoUpload: true,
                        },
                        multiple: false,
                        localization: {
                            select: localization.SendEmailAddAttachment,
                            dropFilesHere: ""
                        },
                        showFileList: false,
                        select: function (e) {
                            var filename = $.map(e.files, function (file) { return _.unescape(file.name); }).join(", ");
                            _vmWindow.set("emailAttachment", filename);
                        },
                        complete: function (e) {
                            //hide upload status
                            cont.find(".k-upload").addClass("k-upload-empty");
                            cont.find(".k-upload-status-total").hide();
                        },
                        success: function (e) {
                            if (e.operation == "upload") {
                                var result = $.parseJSON(e.response);

                                if (result.FileAttachment) {
                                    _vmWindow.set("sendEmailAttachment", result.FileAttachment);
                                    _vmWindow.set("attachmentErrorMessage", "");
                                    _vmWindow.set("okEnabled", true);

                                } else if (result.message) {
                                    _vmWindow.set("attachmentErrorMessage", result.message);
                                    _vmWindow.set("okEnabled", false);
                                    _vmWindow.set("emailAttachment", "");
                                }
                            }
                        },
                        error: function (e) {
                            _vmWindow.set("attachmentErrorMessage", localization.FileAttachmentSizeError);
                            _vmWindow.set("okEnabled", false);
                        }
                    });
                    //hide drag and drop zone
                    cont.find(".k-dropzone").removeClass("k-dropzone");

                    //remove attachment event.
                    cont.find(".k-button").click(function () {
                        _vmWindow.set("emailAttachment", "");
                        cont.find(".k-upload-files.k-reset").find("li").remove();
                    });
                }

                var sendEmail = function (_vmWindow) {
                    var bChangeStatus = _vmWindow.changeStatus;
                    var bAddActionLog = _vmWindow.addToLog;
                    var addToLogSkipped = false;
                    var bHasAttachment = (_vmWindow.emailAttachment != "");
                    var strAttachedFileName = _vmWindow.emailAttachment;
                    var strMessage = encodeURIComponent(_vmWindow.emailHTMLMessage);
                    var strMessagePlain = _vmWindow.emailTextMessage;
                    var emailData = {
                        To: _vmWindow.emailTo,
                        Cc: _vmWindow.emailCC,
                        Subject: _vmWindow.emailSubject.replace(/</g, "%3C").replace(/>/g, "%3E"),
                        Message: strMessage,
                        AttachedFileName: strAttachedFileName,
                        WorkItemId: vm.viewModel.BaseId
                    };
                    var sendEmailAttachment = _vmWindow.sendEmailAttachment;
                    var bSetFirstResponsDate = _vmWindow.setFirstResponseDate;

                    $.ajax({
                        url: "/EmailNotification/SendEmailNotification",
                        type: "POST",
                        data: emailData,
                        success: function (data, textStatus, jqXHR) {
                            var bSuccess = data.toLowerCase() == "true" ? true : false;
                            kendo.ui.progress($(".k-window"), false);
                            if (bSuccess) {
                                win.close();
                                $.when(kendo.ui.ExtAlertDialog.show({
                                    title: localization.SendEmail,
                                    message: localization.SendEmailSuccessMessage
                                })).done(function (response) {
                                    //first check if we need to process additional WI changes 
                                    if (bChangeStatus) {
                                        vm.viewModel.Status.set("Id", app.constants.workItemStatuses.Incident.Pending);
                                        vm.viewModel.Status.set("Name", localization.Pending);
                                    }
                                    if (bHasAttachment) {
                                        //add file attachment details to vm after email is sent
                                        if (!_.isUndefined(vm.viewModel.FileAttachment)) {
                                            vm.viewModel.FileAttachment.push(sendEmailAttachment);
                                        }

                                        var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                                        if (actionLogType) {
                                            vm.viewModel[actionLogType].unshift(new app.dataModels[actionLogType].fileAdded(strAttachedFileName));
                                        }
                                    }

                                    if (bAddActionLog) {
                                        strMessagePlain = _.isUndefined(strMessagePlain) ? "" : strMessagePlain.substring(0, 4000);

                                        if (strMessagePlain.length > 0) {
                                            addToCommentLog(strMessagePlain.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                                        } else {
                                            bAddActionLog = false;
                                            addToLogSkipped = true;
                                        }
                                    }

                                    if (bSetFirstResponsDate) {
                                        vm.viewModel.set("FirstResponseDate", new Date().toISOString());
                                    }

                                    //--end additional change checks/processing

                                    //save changes and show warnings, if any
                                    var handleSaveSuccess = function () {
                                        if (bAddActionLog || bHasAttachment || bChangeStatus || bSetFirstResponsDate) {
                                            vm.save(function () {
                                                app.lib.message.add(localization.ChangesApplied, "success");
                                                switch (vm.type) {
                                                    case "ChangeRequest":
                                                        location.href = "/ChangeRequest/Edit/" + vm.viewModel.Id + "/";
                                                        break;
                                                    case "ServiceRequest":
                                                        location.href = "/ServiceRequest/Edit/" + vm.viewModel.Id + "/";
                                                        break;
                                                    case "Incident":
                                                        location.href = "/Incident/Edit/" + vm.viewModel.Id + "/";
                                                        break;
                                                    case "Problem":
                                                        location.href = "/Problem/Edit/" + vm.viewModel.Id + "/";
                                                        break;
                                                    case "ReleaseRecord":
                                                        location.href = "/ReleaseRecord/Edit/" + vm.viewModel.Id + "/";
                                                        break;
                                                    default:
                                                        //my workitem view
                                                        location.href = "/View/cca5abda-6803-4833-accd-d59a43e2d2cf/";
                                                        break;
                                                }
                                            }, saveFailure);
                                        }
                                    }
                                    if (addToLogSkipped) {
                                        //note: addToLogSkipped dialog will only show if the empty message validation fails
                                        $.when(kendo.ui.ExtAlertDialog.show({
                                            title: localization.SkippedAddingLogEntryTitle,
                                            message: localization.ErrorAddingLogEntryMessage,
                                            icon: "fa fa-warning"
                                        })).done(function() {
                                            handleSaveSuccess();
                                        });
                                    } else {
                                        handleSaveSuccess();
                                    }
                                    //--end save changes and warnings
                                });
                            } else {
                                $.when(kendo.ui.ExtAlertDialog.show({
                                    title: localization.SendEmail,
                                    message: localization.SendEmailFailedMessage
                                }));
                                kendo.ui.progress($(".k-window"), false);
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR, textStatus, errorThrown)
                        }
                    });
                }

                var buildEditor = function (targetEle, vm) {
                    var defaultTools = [
                         "bold", "italic", "underline",
                         "formatting", "foreColor", "backColor",
                         "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
                         "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                         "createLink", "unlink", "insertImage",
                         "viewHtml",
                         "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn"
                    ];
                    var mobileTools = [
                        "formatting",
                        "createLink", "unlink", "insertImage", "viewHtml",
                        "bold", "italic", "underline",
                        "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                        "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn"
                    ];
                    var editor = targetEle.data("kendoEditor");
                    if (!_.isUndefined(editor)) { return;}
                    editor = targetEle.kendoEditor({
                        resizable: {
                            content: true,
                            toolbar: true
                        },
                        change: function(e) {
                            var content = e.sender.body.innerText || e.sender.body.textContent;
                            vm.set("emailTextMessage", content);
                        },
                        tools: app.isMobileDevice() ? mobileTools : defaultTools,
                        encoded: true,
                        paste: function(e) {
                            //added to fix BUG2808. On Chrome, when doing a copy-paste of content to kendo editor, the editor wraps line-breaks with <div clas="k-paste-container"/>. 
                            //Removed the added class so newlines/line breaks will properly render on Chrome.
                            e.html = e.html.replace(/k-paste-container/g, "");
                        }
                    });
                }
                */
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
                                wrap: false,
                                model: anchorViewModel
                            });
                        //send anchor element back to caller (appended in the callback)
                        callback(anchorElm.render());
                        return anchorElm;
                    }
                };
                /* END functions */

                /* Initialization code */
                function initFormTask() {
                    var modalEle = buildAndRender.windowEle(sendEmailTemplate),
                        formTaskViewModel = getFormTaskViewModel(modalEle),
                        anchorTemplateProps = { Target: node.Task };
                    buildAndRender.taskListItem(anchorTemplateProps, formTaskViewModel, anchorTemplate);
                }

                initFormTask();
            }
        };

    return definition;

});