'use strict';

const FauxMo = require('fauxmojs');

let fauxMo = new FauxMo(
  {
    devices: [
      {
        name: 'projector screen',
        port: 11000,
        handler: (action) => {
          console.log('projector screen action:', action);
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

console.log('started..');
