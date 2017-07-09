// Must be run with --harmony-async-await or node >= 7.6.0

/*
receiver: 1.0.0.0
pulse 1.1.0.0
pi 1.2.0.0
chromecast:  1.3.0.0
*/

const cec = require('node-cec')

class CecControl {
  constructor () {
    this.client = new cec.NodeCec()
    this._shutdown_listener = null
  }

  async start () {
    if (this._shutdown_listener != null) {
      throw new Error('Already started')
    }
    this.client.start('cec-client', '-d', '8', '-b', 'r')

    this._shutdown_listener = () => { this.stop() }
    process.once('beforeExit', this._shutdown_listener)

    return await this.waitReady(30000)
  }

  stop () {
    if (this._shutdown_listener) {
      process.removeListener('beforeExit', this._shutdown_listener)
      this._shutdown_listener = null
    }
    this.client.stop()
  }

  async receiverOn() {
    return await this.sendCommand(
      0x15, // recorder 1 -> audio
      cec.CEC.Opcode.USER_CONTROL_PRESSED,
      cec.CEC.UserControlCode.POWER_ON_FUNCTION
    )
  }

  async receiverOff() {
    return await this.sendCommand(
      0x15, // recorder 1 -> audio
      cec.CEC.Opcode.USER_CONTROL_PRESSED,
      cec.CEC.UserControlCode.POWER_OFF_FUNCTION
    )
  }

  async powerOff() {
    return await this.sendCommand(
      0x1F, // recorder 1 -> broadcast
      cec.CEC.Opcode.STANDBY
    )
  }

  // tx 1F:82:11:00
  async activatePulse() {
    return await this.sendCommand(
      0x1f, // recorder 1 -> broadcast
      cec.CEC.Opcode.ACTIVE_SOURCE,
      0x11, 0x00 // 1.1.0.0
    )
  }
  // chromecast
  // tx 1F:82:13:00
  async activateUnplugged() {
    return await this.sendCommand(
      0x1f, // recorder 1 -> broadcast
      cec.CEC.Opcode.ACTIVE_SOURCE,
      0x12, 0x00 // 1.3.0.0
    )
  }
  // pi
  // tx 1F:82:12:00
  async activateRumours() {
    return await this.sendCommand(
      0x1f, // recorder 1 -> broadcast
      cec.CEC.Opcode.ACTIVE_SOURCE,
      0x12, 0x00 // 1.2.0.0
    )
  }

  // 0-100
  async setVolume (level) {
    const audioStatus = await this.getAudioStatus()
    // display is 0-80, cec is 0-100
    // level is 0/100
    // convert level & desired level into step numbers
    const currentStep = Math.ceil(audioStatus.level / 1.25)
    const desiredStep = Math.ceil(level / 1.25)
    const distance = desiredStep - currentStep

    if (distance > 0) {
      return await this.volumeUp(distance)
    } else if (distance < 0) {
      return await this.volumeDown(distance)
    } else {
      return await Promise.resolve()
    }
  }

  async volumeUp (times = 1) {
    for (let i = 0; i < times; i++) {
      await this.sendCommand(
        0x15, // recorder 1 -> audio
        cec.CEC.Opcode.USER_CONTROL_PRESSED,
        cec.CEC.UserControlCode.VOLUME_UP
      )
    }
    await this.sendCommand(
      0x15, // recorder 1 -> audio
      cec.CEC.Opcode.USER_CONTROL_RELEASE
    )
  }

  async volumeDown (times = 1) {
    for (let i = 0; i < times; i++) {
      await this.sendCommand(
        0x15, // recorder 1 -> audio
        cec.CEC.Opcode.USER_CONTROL_PRESSED,
        cec.CEC.UserControlCode.VOLUME_DOWN
      )
    }
    await this.sendCommand(
      0x15, // recorder 1 -> audio
      cec.CEC.Opcode.USER_CONTROL_RELEASE
    )
  }

  async getAudioStatus () {
    await this.client.sendCommand(
      0x15, // recorder 1 -> audio
      cec.CEC.Opcode.GIVE_AUDIO_STATUS
    )
    const packet = await this.waitPacket('REPORT_AUDIO_STATUS')

    const status = packet.args[0]
    const muted = (0x80 & status) == 0x80
    // level: values range from 0-100
    const level = status & ~0x80

    return { muted, level }
  }

  async sendCommand (...args) {
    this.client.sendCommand(...args)
    await this.waitReady()
  }

  async waitReady (timeout = 1000) {
    return await new Promise((resolve, reject) => {
      let timeoutId = -1

      const readyListener = () => {
        if (timeoutId != -1) {
          clearTimeout(timeoutId)
        }
        resolve()
      }
      this.client.once('ready', readyListener)

      timeoutId = setTimeout(() => {
        this.client.removeListener('ready', readyListener)
        reject(new Error('timed out waiting for ready'))
      }, timeout)
    })
  }

  async waitPacket (opcode, timeout = 2000) {
    return await new Promise((resolve, reject) => {
      let timeoutId = -1
      const listener = (packet) => {
        if (timeoutId != -1) {
          clearTimeout(timeoutId)
        }
        resolve(packet)
      }
      this.client.once(opcode, listener)

      timeoutId = setTimeout(() => {
        this.client.removeListener(opcode, listener)
        reject(new Error('timed out while waiting for command: ' + opcode))
      }, timeout)
    })
  }
}

module.exports = CecControl;
