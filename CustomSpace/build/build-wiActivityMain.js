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
    namespace: 'wiActivityMainBuilder',
    include: [
        'requireLib',
        'forms/wiActivityMain'
    ],
    out: 'C:/inetpub/CiresonPortal/CustomSpace/Scripts/forms/wiActivityMain-built.min.js',
    findNestedDependencies: true
})