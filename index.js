'use strict';

const FauxMo = require('fauxmojs');
const Lirc = require('lib/lirc');
const Cec = require('lib/cec');
const Wol = require('lib/wol');


const lirc = new Lirc();
const cec = new Cec();
const wol = new Wol();

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
              lirc.screenOn();
              break;
            case "off":
              lirc.screenOff();
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
              lirc.projectorOn();
              break;
            case "off":
              lirc.projectorOff();
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
          switch (action) {
            case "on":
              cec.receiverOn();
              break;
            case "off":
              cec.receiverOff();
              break;
            default:
              console.log('Receiver failed on unknown action:', action);
          }
        }
      },
      {
        name: 'movie',
        port: 11003,
        handler: (action) => {
          (async () => {
            switch(action) {
              case "on":
                await lirc.screenOn();
                await cec.activatePulse();
                // TODO: movie audio
                await lirc.projectorOn();
                break;
              case "off":
                await lirc.screenOff();
                await cec.powerOff();
                await lirc.projectorOff();
                break;
              default:
                console.log('Movie failed on unknown action:', action);
            }
          })();
        }
      },
      {
        name: 'amnejhiac',
        port: 11004,
        handler: (action) => {
          switch(action) {
            case 'on':
              wol.amnesiacWake();
              break;
            case 'off':
              wol.amnesiacSuspend();
              break;
            default:
              console.log('amnesiac failed on unknown action: ', action);
          }
        }
      }
    ]
  });

console.log('started...');
