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
          if (action == "on"){
            LircNode.irsend.send_once("projector", ["KEY_POWER", "KEY_POWER"]);
          } else if (action == "off") {
            // Projector requires two consecutive suspend commands in order to shut off
            LircNode.irsend.send_once("projector", ["KEY_SUSPEND", "KEY_SUSPEND"], () => {
				setTimeout(() => {
					LircNode.irsend.send_once("projector", ["KEY_SUSPEND", "KEY_SUSPEND"]);
				}, 1000);
			});
          } else {
            console.log('Projector failed on unknown action:', action);
          }
        }
      },
      {
        name: 'receiver',
        port: 11002,
        handler: (action) => {
          if (action == "on" || action == "off") {
            LircNode.irsend.send_once("receiver", ["KEY_POWER", "KEY_POWER", "KEY_POWER"]);
          } else {
            console.log('Receiver failed on unknown action:', action);
          }
        }
      }
    ]
  });

console.log('started...');
