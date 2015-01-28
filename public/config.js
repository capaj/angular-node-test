System.config({
  "paths": {
    "*": "*.js",
    "angular-node-test/*": "lib/*.js",
    "github:*": "jspm_packages/github/*.js"
  }
});

System.config({
  "map": {
    "angular-material": "github:angular/bower-material@0.7.0",
    "github:angular/bower-angular-animate@1.3.11": {
      "angular": "github:angular/bower-angular@1.3.11"
    },
    "github:angular/bower-angular-aria@1.3.11": {
      "angular": "github:angular/bower-angular@1.3.11"
    },
    "github:angular/bower-material@0.7.0": {
      "angular": "github:angular/bower-angular@1.3.11",
      "angular-animate": "github:angular/bower-angular-animate@1.3.11",
      "angular-aria": "github:angular/bower-angular-aria@1.3.11",
      "css": "github:systemjs/plugin-css@0.1.0",
      "hammer": "github:hammerjs/hammer.js@2.0.4"
    }
  }
});
