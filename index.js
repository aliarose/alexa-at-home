'use strict';

const LircNode = require('lirc_node');
const FauxMo = require('fauxmojs');

LircNode.init();

let fauxMo = new FauxMo(
  {
    devices: [
      {
        name: 'screen',
        port: 11000,
        handler: (action) => {
          if (action == "on"){
            LircNode.irsend.send_once("screen", ["KEY_DOWN", "KEY_DOWN", "KEY_DOWN"]);
          } else if (action == "off") {
            LircNode.irsend.send_once("screen", ["KEY_UP", "KEY_UP", "KEY_UP"]);
          } else {
            console.log('Screen failed on unknown action:', action);
          }
        }
      },
      {
        name: 'projector',
        port: 11001,
        handler: (action) => {
          console.log('projector action:', action);
        }
      },
      {
        name: 'receiver',
        port: 11002,
        handler: (action) => {
          console.log('receiver action:', action);
        }
      }
    ]
  });

console.log('started...');
