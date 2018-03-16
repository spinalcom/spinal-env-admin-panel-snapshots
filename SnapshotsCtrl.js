(function () {
  compareTo.$inject = [];

  function compareTo() {

    return {
      require: "ngModel",
      scope: {
        compareTolValue: "=compareTo"
      },
      link: function (scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function (modelValue) {

          return modelValue == scope.compareTolValue;
        };

        scope.$watch("compareTolValue", function () {
          ngModel.$validate();
        });
      }
    };
  }

  angular.module('app.spinal-panel')
    .directive('compareTo', compareTo)
    .provider('$copyToClipboard', [function () {

      this.$get = ['$q', '$window', function ($q, $window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
          position: 'fixed',
          opacity: '0'
        });
        return {
          copy: function (stringToCopy) {
            var deferred = $q.defer();
            deferred.notify("copying the text to clipboard");
            textarea.val(stringToCopy);
            body.append(textarea);
            textarea[0].select();

            try {
              var successful = $window.document.execCommand('copy');
              if (!successful) throw successful;
              deferred.resolve(successful);
            } catch (err) {
              deferred.reject(err);
              //window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
            } finally {
              textarea.remove();
            }
            return deferred.promise;
          }
        };
      }];
    }])

    .controller('SnapshotsCtrl', ["$scope", "$injector", "authService", "$mdToast", "$interval", "$timeout", "SpinalSnapshotsService", "spinalModelDictionary", "$mdDialog", "$templateCache",
      function ($scope, $injector, authService, $mdToast, $interval, $timeout, SpinalSnapshotsService, spinalModelDictionary, $mdDialog, $templateCache) {
        $scope.injector = $injector;
        $scope.snapshots = [];
        $scope.mainMenuClick = (btn) => {
          btn.action(btn);
        };

        let systems = [];

        SpinalSnapshotsService.getList(function(systemList) {
          systems = systemList;
          $scope.$apply($scope.snapshots = systemList.get());
          console.log(systemList.get());
          //console.log(systemList.get());
        });

        $scope.addSystem = () => {
          console.log("addSystem");
          $mdDialog.show({
            ariaLabel: 'AddSystem',
            template: $templateCache.get("snapshot-manager-create-system.html"),
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: true,
            controller: ["$scope", "$mdDialog", "$copyToClipboard", "$mdToast", "$window", "SpinalSnapshotsService", AddSystemCtrl],
            locals: {
              spinalModelDictionary: spinalModelDictionary,
            }
          })
        };


        $scope.viewList = (i) => {

          systems[i].load(function(system) {

            $mdDialog.show({
              ariaLabel: 'ContainerList',
              template: $templateCache.get("snapshot-manager-list.html"),
              parent: angular.element(document.body),
              clickOutsideToClose: true,
              fullscreen: true,
              controller: ["$scope", "$mdDialog", "$copyToClipboard", "$mdToast", "$window", "system", ContainerListCtrl],
              locals: {
                system: system,
                spinalModelDictionary: spinalModelDictionary,
              }
            });
            
          });

        };

        $scope.deploySystem = (i) => {

          systems[i].load(function(system) {

            $mdDialog.show({
              ariaLabel: 'ContainerDeploy',
              template: $templateCache.get("snapshot-manager-deploy.html"),
              parent: angular.element(document.body),
              clickOutsideToClose: true,
              fullscreen: true,
              controller: ["$scope", "$mdDialog", "$copyToClipboard", "$mdToast", "$window", "system", ContainerDeployCtrl],
              locals: {
                system: system,
                spinalModelDictionary: spinalModelDictionary,
              }
            });
            
          });

        };

        $scope.getUserIcon = (user) => {
          if (user.selected === true)
            return "done";
          return "desktop_windows";
        };
        $scope.clickUserIcon = (user) => {
          console.log("clickUserIcon");
          user.selected = !user.selected;
        };
        $scope.selectedStyle = (user) => {
          if (user && user.selected)
            return 'background-color: #4185f4';
          return '';
        };
        $scope.clearSelect = () => {
          for (var i = 0; i < $scope.snapshots.length; i++) {
            $scope.snapshots[i].selected = false;
          }
        };
        $scope.showMainBtn = (btn) => {
          if (btn.show_only_if_selected === true) {
            return false;
          }
          return true;
        };

        $scope.mainMenuBtn = [{
            label: "addSystem",
            action: $scope.addSystem,
            icon: "add_to_queue",
            show_only_if_selected: false
          },
          {
            label: "clearSelect",
            action: $scope.clearSelect,
            icon: "block",
            show_only_if_selected: true
          },
        ];

      }
    ]);

  var ContainerListCtrl = function ($scope, $mdDialog, $copyToClipboard, $mdToast, $window, system) {

    $scope.containers = system.containers.get();
    $scope.needsRestore = -1;
    system.volumes.bind(function () {
      if (system.volumes.has_been_modified()) {
        $scope.$apply($scope.volumes = system.volumes.get());
        
      }
    });

    $scope.cancel = function () {
      $mdDialog.cancel();
    }

    $scope.system = system.get();

    $scope.deleteVolume = function (i) {
      system.removeVolume(i);
    }

    $scope.start = function (i) {
      system.startContainer(i);
    }

    $scope.stop = function (i) {
      system.stopContainer(i);
    }

    $scope.restore = function (i) {
      $scope.needsRestore = i;
    }

    $scope.confirmRestore = function (i) {
      system.stopContainer(i);
    }

    $scope.createSnapshot = function (i) {
      system.addVolume(i);
    }

    $scope.getContainerUrl = function (i) {
      return 'http://' + location.hostname + ':' + system.containers[i].port.get() + '/html/admin';
    }

    $scope.getConainerIcon = function () {
      return "settings";
    }

    $scope.delete_system = function(system) {
      console.log('delete system');
    }

  };


  var ContainerDeployCtrl = function ($scope, $mdDialog, $copyToClipboard, $mdToast, $window, system) {

    //$scope.containers = system.containers.get();
    $scope.system = system.get();

    $scope.cancel = function () {
      $mdDialog.cancel();
    }

    $scope.deploy = function(port, name) {
      system.newContainer(port, name);
      $mdDialog.hide();
    }

    $scope.delete_system = function(system) {
      console.log('delete system');
    }

  };

  var AddSystemCtrl = function ($scope, $mdDialog, $copyToClipboard, $mdToast, $window, SpinalSnapshotsService) {

    $scope.doSendMail = false;
    $scope.system = {
      name: ""
    };
    $scope.newSystemCancel = () => {
      console.log("newSystemCancel");
      $mdDialog.cancel();
    };

    $scope.newSystemOK = (systemForm, system) => {
      console.log('system saved');
      SpinalSnapshotsService.addSystem(system.name);

      if (systemForm.$valid) {
        $mdDialog.hide(system);
        return;
      }

    };

  };

})();
