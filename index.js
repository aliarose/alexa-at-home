'use strict';

const LircNode = require('lirc_node');
const FauxMo = require('fauxmojs');

LircNode.init();

// Class Helper for on/off
class Helper {
  screenOn(callback) {
    LircNode.irsend.send_once("screen", ["KEY_DOWN"], callback);
  }
  screenOff(callback) {
    LircNode.irsend.send_once("screen", ["KEY_UP"], callback);
  }
  projectorOn(callback) {
    LircNode.irsend.send_once("projector", ["KEY_POWER"], callback);
  }
  projectorOff(callback) {
    // Projector requires two consecutive suspend commands in order to shut off
    LircNode.irsend.send_once("projector", ["KEY_SUSPEND"], () => {
      setTimeout( () => {
        LircNode.irsend.send_once("projector", ["KEY_SUSPEND"], callback);
      }, 1000);
    });
  }
  receiverOnOff(callback) {
    LircNode.irsend.send_once("receiver", ["KEY_POWER"], callback);
  }
}

let helper = new Helper();
let fauxMo = new FauxMo(
  {
    devices: [
      {
        name: 'screen',
        port: 11000,
        handler: (action) => {
          switch(action) {
            case "on":
              helper.screenOn();
              break;
            case "off":
              helper.screenOff();
              break;
            default:
              console.log('Screen failed on unknown action:', action);
          }
        }
      },
      {
        name: 'projector',
        port: 11001,
        handler: (action) => {
          switch(action) {
            case "on":
              helper.projectorOn();
              break;
            case "off":
              helper.projectorOff();
              break;
            default:
              console.log('Projector failed on unknown action:', action);
          }
        }
      },
      {
        name: 'receiver',
        port: 11002,
        handler: (action) => {
          if (action == "on" || action == "off") {
            helper.receiverOnOff();
          } else {
            console.log('Receiver failed on unknown action:', action);
          }
        }
      },
      {
        name: 'movie',
        port: 11003,
        handler: (action) => {
          switch(action) {
            case "on":
              // Turn on screen, projector, and receiver
              helper.screenOn(() => {
                helper.receiverOnOff(() => {
                    helper.projectorOn();
                });
              });
              break;
            case "off":
              // Turn off screen, projector, and receiver
              helper.screenOff(() => {
                helper.receiverOnOff(() => {
                  setTimeout(() => {
                    helper.projectorOff()
                  }, 1000);
                });
              });
              break;
            default:
              console.log('Movie failed on unknown action:', action);
          }
        }
      }
    ]
  });

console.log('started...');
