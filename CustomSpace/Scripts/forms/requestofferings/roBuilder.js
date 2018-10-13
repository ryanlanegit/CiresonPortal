/*jslint nomen: true */
/*global _, $, app, console, custom, define, document, kendo, setTimeout */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Request Offering Builder
**/

define([
    'text!/CustomSpace/Scripts/forms/fields/addInformation/view.html',
    'text!/CustomSpace/Scripts/forms/fields/characterCount/view.html',
    'text!/CustomSpace/Scripts/forms/fields/summary/view.html'
], function (
    addInformationTemplate,
    characterCountTemplate,
    summaryTemplate
) {
    var nodeConfig = {
        Name: 'ROBuilder',
        Type: 'RequestOffering',
        Label: 'Request Offering Builder',
        Access: true,
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
            node: nodeConfig,
            build: function build(vm, node, callback) {
                if (custom.debug) {
                    console.log('Build', 'Request Offering Toolbox');
                }
                /* BEGIN Functions */

                // Add the Minimum / Maximum required text to the page
                function createCharacterCount(targetTextArea, options) {
                    $(targetTextArea).parent().find('span.charCount').remove();
                    var currentLength = $(targetTextArea).val().length,
                        builtCharCount = _.template(characterCountTemplate);

                    options.minRemainingCharacters = options.charMin - currentLength;
                    options.remainingCharacters = options.charMax - currentLength;

                    $(targetTextArea).parent().append(builtCharCount(options));
                }
                
                function createSummary(targetEle) {
                    if (!targetEle) { app.controls.exception("targetEle missing - controls.userInputs"); }

                    var gridEle = targetEle.find("div[data-control-grid]"),
                        gridDataSource = new kendo.data.DataSource({
                            transport: {
                                getUserInput: function getUserInput() {
                                    var questionRows = $('div.page-panel').find('.question-container').filter(":not(.ng-hide)"),
                                        userInput = [];
                                    console.log('getUserInput > questionRows', questionRows);

                                    questionRows.each(function () {
                                        var questionRow = $(this),
                                            questionType = questionRow.find('input.question-answer-type').val().toLowerCase(),
                                            questionLabel = questionRow.find('label.control-label '),
                                            questionInput = questionRow.find('input[id]'),
                                            questionValue = questionInput.val(),
                                            userInputItem;

                                        switch (questionType) {
                                        case 'integer':
                                            questionType = 'int';
                                            break;
                                        case 'list':
                                            if (custom.utils.isGuid(questionValue)) {
                                                questionType = 'enum';
                                            }
                                            break;
                                        case 'boolean':
                                            questionType = 'bool';
                                            questionLabel = questionRow.find('label.checkbox-label');
                                            switch (questionValue) {
                                            case 'on':
                                                questionValue = 'True';
                                                break;
                                            case 'off':
                                                questionValue = 'False';
                                                break;
                                            }
                                            break;
                                        }

                                        userInputItem = {
                                            Question: questionLabel.text().replace('(Required)', '').replace(/\n/g, ''),
                                            Answer: questionValue,
                                            Type: questionType
                                        };
                                        userInput.push(userInputItem);
                                        //console.log(questionLabel.text().replace('(Required)',''), questionValue);
                                    });

                                    return userInput;
                                },
                                parseUserInput: function parseUserInput(userInput) {
                                    var parsedUserInput = [];
                                    function attachmentFilter(attachment) {
                                        return (attachment !== 'null');
                                    }
                                    
                                    userInput.forEach(function (item) {
                                        var parsedInputItem = {
                                            Answer : item.Answer,
                                            Question : item.Question
                                        };

                                        switch (item.Type) {
                                        case 'enum':
                                            app.lib.getEnumDisplayName(parsedInputItem.Answer).success(function (data) {
                                                parsedInputItem.Answer = data;
                                            });
                                            break;
                                        case 'datetime':
                                            parsedInputItem.Answer = app.lib.getFormattedLocalDateTime(parsedInputItem.Answer);
                                            break;
                                        case 'fileattachment':
                                            parsedInputItem.Answer = parsedInputItem.Answer.split('(((;)))').join(',').split('(((:)))').join(',').split(',').filter(attachmentFilter).join('<br/>');
                                            break;
                                        default:
                                            if (typeof (parsedInputItem.Answer) === 'object') {
                                                parsedInputItem.Answer = app.lib.getQueryResultDisplayText(item);
                                            }
                                        }

                                        parsedUserInput.push(parsedInputItem);
                                    });
                                    return parsedUserInput;
                                },
                                create: function (options) {
                                    options.success(this.parseUserInput(this.getUserInput()));
                                },
                                read: function (options) {
                                    options.success(this.parseUserInput(this.getUserInput()));
                                }
                            }
                        }),
                        kendoGrid = gridEle.kendoGrid({
                            dataSource: gridDataSource,
                            columns: [{
                                field: "Question",
                                encoded: false
                            }, {
                                field: "Answer",
                                encoded: false
                            }]
                        });
                    gridEle.find('.k-grid-header').hide();
                    gridEle.find('.k-grid-toolbar').hide();

                    $('#drawer-taskbar').find('button:contains("Next")').click(function () {
                        $('section[ng-show="(currentIndex==1)"]').find("div.page-panel").find('div[data-control-grid]').data().handler.dataSource.read();
                    });

                    return kendoGrid;
                }


                //template .build() and view.renderererers.
                var buildAndRender = {
                    AddClass: function (promptElm, options) {
                        if (!options.cssclass) {
                            return;
                        }
                        var target = promptElm.next();
                        target.addClass(options.cssclass);
                    },
                    AutoSize: function (promptElm, options) {
                        console.log('autoSize', promptElm);
                        
                        options.next = options.next || 1;
                        
                        var i = 0,
                            target = promptElm,
                            targetContainer;
                        
                        for (i = 0; i < options.next; i += 1) {
                            target = target.next();
                            if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                                target = target.next();
                            }
                            
                            targetContainer = target.find("textarea");

                            targetContainer.autosize();
                        }
                    },
                    AddInformation: function (promptElm, options) {
                        if (!options.info && !options.icon) {
                            return;
                        }
                        console.log('addinformation', promptElm);
                        var target = promptElm.next(),
                            builtInfo = _.template(addInformationTemplate),
                            infoResult = builtInfo(options);
                        $(target).append(infoResult);
                    },
                    CharCount: function (promptElm, options) {
                        console.log('charCount', promptElm);
                        var target = promptElm.next(),
                            targetTextArea = $(target).find('textarea');
                        options = {
                            minText: options.minText || "Minimum Extra Characters Required",
                            maxText: options.maxText || "Maximum Characters Remaining",
                            showMin: options.showMin || 'true',
                            showMax: options.showMax || 'true',
                            showMinMax: options.showMinMax || 'false',
                            charMin: $(targetTextArea).parent().find('input').attr('minlength') || 0,
                            charMax: $(targetTextArea).parent().find('input').attr('maxlength') || 0
                        };

                        $(targetTextArea).on('paste', function () {
                            setTimeout(function () {
                                createCharacterCount($(this), options);
                            }, 100);
                        });
                        $(targetTextArea).on('keyup', function () {
                            createCharacterCount($(this), options);
                        });
                    },
                    Indent: function (promptElm, options) {
                        console.log('indent', promptElm);

                        options.level = options.level || 1;
                        options.next = options.next || 1;
                        
                        var i = 0,
                            target = promptElm,
                            targetContainer;
                        
                        for (i = 0; i < options.next; i += 1) {
                            target = target.next();
                            if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                                target = target.next();
                            }
                            
                            targetContainer = $(target).children('div.col-xs-12');

                            targetContainer.addClass('indent-' + options.level);
                        }
                    },
                    LayoutTemplate: function (promptElm, options) {
                        if (!options.template) {
                            return;
                        }
                    },
                    SetAttribute: function (promptElm, options) {
                        console.log('setAttribute', promptElm);
                        var target = promptElm.next();

                        $(target).find('[data-role]').attr(options);
                    },
                    SetOptions: function (promptElm, options) {
                        console.log('setOptions', promptElm);
                        var target = promptElm.next();

                        $(target).find('[data-role]').data().handler.setOptions(options);
                    },
                    SingleLineEntry: function (promptElm, options) {
                        console.log('singleLineEntry', promptElm);
                        
                        options.next = options.next || 1;
                        
                        var i = 0,
                            target = promptElm;
                        
                        for (i = 0; i < options.next; i += 1) {
                            target = target.next();
                            if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                                target = target.next();
                            }
                            
                            $(target).keydown(function (event) {
                                if (event.which === 13) {
                                    event.preventDefault();
                                }
                            }).keyup(function (event) {
                                if (event.which === 13) {
                                    event.preventDefault();
                                }
                            }).bind('paste', function (e) {
                                var data = e.originalEvent.clipboardData.getData('Text');
                                console.log('Paste Event', data);
                            });
                        }
                    },
                    Summary: function (promptElm) {
                        console.log('summary', promptElm);
                        var target = promptElm.next().find('div.col-xs-12'),
                            builtSummary = _.template(summaryTemplate),
                            summaryResult = builtSummary();
                        $(target).removeClass('col-md-8').addClass('col-md-12').html(summaryResult);
                        createSummary(target.find('div[data-control-bind]'));
                    }
                },
                /* END functions */

                /* Initialization code */
                    initFormTask = function initFormTask() {
                        var ROCustomizations = $("div.page-panel").find("p:contains('{\"'), p:contains('{ \"')"),
                            questionRows = $('div.page-panel').find('.question-container');
                        console.log('ROCustomizations', ROCustomizations);
                        console.log('questionRows', questionRows);

                        //return;

                        questionRows.each(function () {
                            var questionRow = $(this),
                                questionId = questionRow.find('input.question-answer-id').attr('value'),
                                questionType = questionRow.find('input.question-answer-type').attr('value'),
                                questionContainer = questionRow.find('div.col-xs-12'),
                                questionFormGroup = questionRow.find('div.form-group'),
                                msgCheck = questionRow.find('span.k-invalid-msg'),
                                msgSpan;

                            if (msgCheck.length === 0 && questionType === 'Integer') {
                                msgSpan = $(document.createElement('span'));
                                msgSpan.addClass('k-invalid-msg').attr('data-for', questionId);
                                questionFormGroup.prepend(msgSpan);
                            }
                            
                            if (questionContainer.hasClass('col-md-4') || questionContainer.hasClass('col-md-8')) {
                                questionContainer.removeClass('col-md-4 col-md-8').addClass('col-md-6');
                            }
                            
                            switch (questionType) {
                            case 'Integer':
                                questionFormGroup.find('input.k-formatted-value').attr('type', 'number');
                                break;
                            }
                        });

                        ROCustomizations.each(function () {
                            var parsedProperties = JSON.parse($(this).text()),
                                propertyContainer = $(this).parent().parent(),
                                prop,
                                options;

                            for (prop in parsedProperties) {
                                if (parsedProperties.hasOwnProperty(prop)) {
                                    if (custom.debug) {
                                        console.log('prop', prop);
                                        console.log('prop value', parsedProperties[prop]);
                                    }

                                    options = parsedProperties[prop];
                                    if (buildAndRender.hasOwnProperty(prop)) {
                                        buildAndRender[prop](propertyContainer, options);
                                    } else {
                                        console.log('Property Not Found For Rendering:', prop);
                                    }
                                }
                            }
                        });
                        callback();
                    };

                console.log('calling initFormTask');
                initFormTask();
            }
        };

    return definition;

});