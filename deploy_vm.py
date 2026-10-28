import paramiko
import time
import sys
import os

VM_IP = os.getenv('VM_IP', '192.168.1.37')
VM_USER = os.getenv('VM_USER', 'boss')
VM_PASS = os.getenv('VM_PASS', '')
REPO_URL = os.getenv('REPO_URL', 'https://github.com/Mansurbek2703/techbozor.git')
APP_DIR = '/home/boss/techbozor'

def run_command(ssh, cmd, sudo=False):
    print(f"\n---> Running: {cmd}")
    if sudo:
        cmd = f"echo {VM_PASS} | sudo -S bash -c \"{cmd}\""
    
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            raw = stdout.channel.recv(2048)
            try:
                text = raw.decode('utf-8', errors='ignore')
                safe_text = ''.join(c if ord(c) < 128 else '?' for c in text)
                sys.stdout.write(safe_text)
                sys.stdout.flush()
            except Exception:
                pass
        time.sleep(0.1)
    
    rest = stdout.read()
    if rest:
        safe_rest = ''.join(chr(b) if b < 128 else '?' for b in rest)
        sys.stdout.write(safe_rest)
        sys.stdout.flush()
        
    exit_code = stdout.channel.recv_exit_status()
    print(f"\n[Exit code: {exit_code}]")
    return exit_code

def main():
    pass

if __name__ == '__main__':
    main()
