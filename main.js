require("./SpinalSnapshotsService");
require("./SnapshotsCtrl");
(function () {
  angular.module('app.spinal-panel')
    .run(["$templateCache", "$http", "goldenLayoutService",
      function ($templateCache, $http, goldenLayoutService) {
        let load_template = (uri, name) => {
          $http.get(uri).then((response) => {
            $templateCache.put(name, response.data);
          }, (errorResponse) => {
            console.log('Cannot load the file ' + uri);
          });
        };

        let toload = [{
          uri: '../templates/spinal-env-admin-pannel-snapshots/snapshot-manager-pannel.html',
          name: 'snapshot-manager-pannel.html'
        }, {
          uri: '../templates/spinal-env-admin-pannel-snapshots/snapshot-manager-create-system.html',
          name: 'snapshot-manager-create-system.html'
        }, {
          uri: '../templates/spinal-env-admin-pannel-snapshots/snapshot-manager-deploy.html',
          name: 'snapshot-manager-deploy.html'
        }, {
          uri: '../templates/spinal-env-admin-pannel-snapshots/snapshot-manager-list.html',
          name: 'snapshot-manager-list.html'
        }];

        for (var i = 0; i < toload.length; i++) {
          load_template(toload[i].uri, toload[i].name);
        }

        goldenLayoutService.registerPanel({
          id: "drag-snapshots-pannel",
          name: "Snapshots Management",
          cfg: {
            isClosable: true,
            title: "Snapshots Management",
            type: 'component',
            width: 20,
            componentName: 'SpinalHome',
            componentState: {
              template: 'snapshot-manager-pannel.html',
              module: 'app.spinal-panel',
              controller: 'SnapshotsCtrl'
            }
          }
        });
      }
    ]);

})();
