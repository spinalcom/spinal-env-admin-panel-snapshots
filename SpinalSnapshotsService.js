angular.module('app.spinal-panel')
  .factory("SpinalSnapshotsService", ['ngSpinalCore', function (ngSpinalCore) {
    let factory = {};
    let options;
    let admin = {
      id: 0,
      password: ""
    };

    factory.addSystem = function (systemName) {
      console.log('sys has been added');

      let systemModel = new DockerImageModel(systemName);

      ngSpinalCore.store(systemModel, 'SpinalSystems/' + systemName.replace("/","_"));
    }

    factory.getList = function (callback) {
      ngSpinalCore.load('SpinalSystems').then(function(systemList) {

        systemList.bind(function() {

          if (systemList.has_been_modified())
            callback(systemList);

        });

      });
    }

    factory.setAdminAccoount = (admin_id, password) => {

    };

    factory.get_user_id = (user_name, password) => {

    };
    factory.get_admin_id = (admin_name, password) => {

    };
    factory.new_account = (user_name, password) => {

    };
    factory.change_password = (user_id, password, new_password) => {

    };
    factory.delete_system = (user_id, password) => {

    };
    factory.change_password_by_admin = (username, password) => {

    };
    factory.delete_account_by_admin = (username) => {

    };
    factory.change_account_rights_by_admin = (username, right) => {

    };



    // var password, user;

    // user = document.getElementById("input_user").value;

    // password = document.getElementById("input_password").value;

    // if (user === "" || password === "") {
    //   return false;
    // }

    // SpinalUserManager.new_account("http://" + config.host + ":" + config.port + "/", user, password, function(response) {
    //   return $.gritter.add({
    //     title: 'Notification',
    //     text: 'Success create new account.'
    //   });
    // }, function(err) {
    //   $.gritter.add({
    //     title: 'Notification',
    //     text: 'Error create new account.'
    //   });
    //   return console.log("Error create new account");
    // });







    return factory;
  }]);

// model.js

function DockerVolumeModel(port) {
    DockerVolumeModel.super(this);

    this.add_attr({
        port: port,
        previous: '',
        current: '', // TODO: change attr 'current' to 'last'
        backups: [],
        toRemove: []
    });

    this.addBackup = function () {
      let date = new Date().getTime()
      let backup = { date: date, name: 'spinalhub_memory_' + this.port.get() + '_backup_' + date, completed: false }
      this.backups.push(backup);
    }

    this.removeBackup = function (volumeName) { // TODO: check that volumeName is not current one
      let list = this.backups.get();

      this.toRemove.push(volumeName);

      let i = list.findIndex((b) => { return b.name == volumeName });

      this.backups.splice(i, 1);
    }

    this.rollBack = function () {
      let aux = this.previous.get();
      this.previous.set('');
      this.current.set(aux);
    }

    this.restoreBackup = function (backupName) {
      let aux = this.current.get();
      this.previous.set(aux);
      this.current.set(backupName);
    }
}

spinalCore.extend(DockerVolumeModel, Model);

function DockerImageModel(name) {
    DockerImageModel.super(this);

    if (!name) name = 'missing_image_name';

    this.add_attr({
        name: name,
        containers: [],
        volumes: []
    });

    this.newContainer = function (port, restoreVolume = false) {
      /*
        containers' status:
        0: new (starting)
        1: started
        2: stopped
        3: to remove
        4: error
        5: to start
        6: to stop
      */

      let containerName = this.name.get().replace(/[^a-zA-Z0-9_.-]/g, "_") + '-' + port;

      let volume = containerName + '_volume';

      this.containers.push({ name: containerName, port: port, volume: volume, status: 0, restoreVolume: restoreVolume });
    }

    this.removeContainer = function (i) {
      this.containers[i].status.set(3);
    }

    this.startContainer = function(i) {
      this.containers[i].status.set(5);
    }

    this.stopContainer = function(i) {
      this.containers[i].status.set(6);
    }

    this.addVolume = function (i) {
      /*
        volumes' status:
        0: new (starting)
        1: created

        3: to remove
        4: error
      */
      let c = this.containers[i].get();
      let now = new Date();

      let volumeName = c.volume + '_' + now.toISOString().replace(/[^a-zA-Z0-9_.-]/g, "_")

      this.volumes.push({ name: volumeName, container: c.name, src: c.volume, date: now.getTime(), status: 0 });
    }

    this.removeVolume = function (i) {
      this.volumes[i].status.set(3);
    }
}

spinalCore.extend(DockerImageModel, Model);
