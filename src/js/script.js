const { ipcRenderer } = require('electron');
const $ = jQuery = require('jquery');
const moment = require('moment');

let current_git_config = null;

function serializeForm(selector) {
  var obj = {};
  var form_val = $(selector).serializeArray();

  for(var i = 0; i < form_val.length; i++) {
    obj[form_val[i].name] = form_val[i].value;
  }

  return obj;
}

function processRequest(classification, data = null) {
  var temp = {
    classification: classification
  };

  if(data != null) {
    temp = {
      ...temp,
      ...data
    };
  }

  ipcRenderer.send('process-request', temp);
}

function processListeners() {
  ipcRenderer.on('process-response', function(e, param) {
    switch(param.classification) {
      case 'load-git-configs':
        var content = '';

        if(param.status == 'ok' && param.data.length > 0) {
          param.data.forEach((item) => {
            content += `<div class="switch-config box bg-white flex flex-row rounded p-4 shadow" data-email="${item.email}">
              <div class="flex flex-col flex-1">
                <div class="font-semibold">${item.name}</div>
                <div class="text-gray-500 text-xs">${item.email}</div>
              </div>
              <div class="items-center flex flex-row justify-center${current_git_config != null && current_git_config.email == item.email ? '' : ' invisible'}">
                <span class="pin pin-primary">&#10003;</span>
              </div>
            </div>`;
          });
        }

        $('#config-list').html(content);
        
        break;
      case 'get-current-git-config':
        if(param.status == 'ok') {
          current_git_config = param.data;
        }

        break;
      default:
        break;
    }
  });
}

function init() {
  processRequest('get-current-git-config');
  processRequest('load-git-configs');

  processListeners();
}

$(function() {
  init();

  $('body').on('submit', '#config-form', function() {
    processRequest('save-git-config', {
      data: serializeForm('#config-form')
    });

    setTimeout(function() {
      processRequest('load-git-configs');
    }, 100);

    return false;
  });

  $('body').on('click', '.switch-config', function() {
    processRequest('switch-git-config', {
      data: $(this).attr('data-email')
    });

    setTimeout(function() {
      processRequest('get-current-git-config');
      processRequest('load-git-configs');
    }, 100);
  });
});
