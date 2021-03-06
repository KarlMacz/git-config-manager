const { ipcMain } = require('electron');
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const moment = require('moment');

const project_folder = `${os.userInfo().homedir}/git-config-manager`;
const config_folder = `${project_folder}/config`;
let storage_data = null;

function initialize() {
  if(!fs.existsSync(project_folder)) {
    fs.mkdirSync(project_folder);
  }

  if(!fs.existsSync(config_folder)) {
    fs.mkdirSync(config_folder);
  }

  if(!fs.existsSync(`${config_folder}/storage.json`)) {
    fs.writeFileSync(`${config_folder}/storage.json`, JSON.stringify({
      git_configurations: []
    }));
  }

  storage_data = JSON.parse(fs.readFileSync(`${config_folder}/storage.json`));
}

ipcMain.on('process-request', (e, param) => {
  let response = null;
  let is_found = false;
  let temp = null;

  initialize();

  switch(param.classification) {
    case 'load-git-configs':
      if(storage_data.git_configurations.length > 0) {
        response = {
          status: 'ok',
          message: 'Git Config list has been successfully retrieved.',
          data: storage_data.git_configurations
        };
      } else {
        response = {
          status: 'fail',
          message: 'No results found.'
        };
      }

      break;
    case 'get-current-git-config':
      storage_data.git_configurations.forEach((item) => {
        let execName = execSync('git config user.name').toString();
        let execEmail = execSync('git config user.email').toString();

        if(item.name == execName.trim() && item.email == execEmail.trim()) {
          temp = item;

          is_found = true;
        }
      });

      if(is_found) {
        response = {
          status: 'ok',
          message: 'Current git config has been successfully retrieved.',
          data: temp
        };
      } else {
        response = {
          status: 'fail',
          message: 'No results found.'
        };
      }
      
      break;
    case 'save-git-config':
      if(storage_data.git_configurations.length > 0) {
        storage_data.git_configurations.forEach((item) => {
          if(item.email == param.data.email) {
            item.name = param.data.name;
            item.type = param.data.type;
  
            is_found = true;
          }
        });
      }

      if(!is_found) {
        storage_data.git_configurations.push({
          name: param.data.name,
          email: param.data.email,
          type: param.data.type
        });
      }

      fs.writeFileSync(`${config_folder}/storage.json`, JSON.stringify(storage_data));

      response = {
        status: 'ok',
        message: 'Git Config has been successfully saved.'
      };

      break;
    case 'switch-git-config':
      if(storage_data.git_configurations.length > 0) {
        storage_data.git_configurations.forEach((item) => {
          if(item.email == param.data) {
            temp = item;
  
            is_found = true;
          }
        });
      }

      if(is_found) {
        execSync(`git config --global user.name "${temp.name}"`).toString();
        execSync(`git config --global user.email ${temp.email}`).toString();

        response = {
          status: 'ok',
          message: 'Git Config has been successfully switched.'
        };
      } else {
        response = {
          status: 'fail',
          message: 'Failed to switch git config.'
        };
      }

      break;
    default:
      response = {
        status: 'fail',
        message: 'Invalid request.'
      };

      break;
  }

  response.classification = param.classification;

  e.reply('process-response', response);
});
