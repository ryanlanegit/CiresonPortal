({
    baseUrl: 'C:/inetpub/CiresonPortal/Scripts',
    paths: {
        requireLib : 'require',
        text: "require/text",
        'angular': 'libs/angular/angular',
        'angularAMD': 'libs/angular/angularAMD',
        'angular-ui-router': 'libs/angular/angular-ui-router',
        'angular-sanitize': 'libs/angular/angular-sanitize',
        'CustomSpace': '../CustomSpace'
    },
    namespace: 'customTasksBuilder',
    include: [
        'requireLib',
        'CustomSpace/build/customTasks'
    ],
    out: 'C:/inetpub/CiresonPortal/CustomSpace/customTasks-built.min.js',
    findNestedDependencies: true
})