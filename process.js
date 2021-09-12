const { ipcMain } = require('electron');
const { execSync } = require('child_process');
const fs = require('fs');
const moment = require('moment');

let storage_data = JSON.parse(fs.readFileSync(`${__dirname}/config/storage.json`));

ipcMain.on('process-request', (e, param) => {
  let response = null;

  switch(param.classification) {
    case 'load-git-configs':
      response = {
        status: 'ok',
        message: 'Git Config list has been successfully retrieved.',
        data: storage_data.git_configurations
      };

      break;
    case 'get-current-git-config':
      let temp = null;

      storage_data.git_configurations.forEach((item) => {
        let execName = execSync('git config user.name').toString();
        let execEmail = execSync('git config user.email').toString();

        if(item.name == execName.trim() && item.email == execEmail.trim()) {
          temp = item;
        }
      });

      response = {
        status: 'ok',
        message: 'Current git config has been successfully retrieved.',
        data: temp
      };
      
      break;
    case 'save-git-config':
      let is_found = false;

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

      fs.writeFileSync(`${__dirname}/config/storage.json`, JSON.stringify(storage_data));

      response = {
        status: 'ok',
        message: 'Git Config has been successfully saved.'
      };

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
