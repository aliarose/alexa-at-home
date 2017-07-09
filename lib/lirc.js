'use strict';

const LircNode = require('lirc_node');
const Utils = require('lib/utils');

LircNode.init();

class LircControl {
  constructor() {
    this.client = LircNode.irsend;
  }

  async screenOn() {
    return await this.send('screen', 'KEY_DOWN');
  }
  async screenOff() {
    return await this.send('screen', 'KEY_UP');
  }

  async projectorOn() {
    return await this.send('projector', 'KEY_POWER');
  }

  async projectorOff() {
    await this.send('projector', 'KEY_SUSPEND');
    await Utils.sleep(1000);
    return await this.send('projector', 'KEY_SUSPEND');
  }

  async receiverOnOff() {
    return await this.send('receiver', 'KEY_POWER');
  }

  async send(target, command) {
    // TODO: error handling
    return await new Promise((resolve, reject) => {
      this.client.send_once(target, [command], () => {
        resolve();
      });
    });
  }
}

module.exports = LircControl;
