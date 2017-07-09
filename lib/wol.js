const exec = require('child_process').exec;

class Wol {
  async amnesiacWake(callback) {
    return await this.exec('wakeonlan  00:25:90:00:e9:7e');
  }
  async amnesiacSuspend(callback) {
    /*
      pi@amnesiac is configured with authorized_keys:
        command="/home/pi/bin/suspend.sh",no-port-forwarding,no-x11-forwarding,no-agent-forwarding <public_key>
      and suspend.sh:
        echo "Suspending..."
        sudo systemctl suspend
      and sudoers:
        pi ALL= NOPASSWD: /usr/bin/systemctl suspend
    */
    return await this.exec("ssh -i ~/.ssh/id_rsa_sol pi@amnesiac.local");
  }

  async exec(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err)  {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  }
}

module.exports = Wol;
