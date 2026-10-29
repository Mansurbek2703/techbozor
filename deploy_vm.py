import paramiko
import time
import sys
import os

VM_IP = os.getenv('VM_IP', '192.168.1.37')
VM_USER = os.getenv('VM_USER', 'boss')
VM_PASS = sys.argv[1] if len(sys.argv) > 1 else os.getenv('VM_PASS', '')
REPO_URL = os.getenv('REPO_URL', 'https://github.com/Mansurbek2703/techbozor.git')
APP_DIR = '/home/boss/techbozor'

def run_command(ssh, cmd, sudo=False):
    print(f"\n---> Running: {cmd}")
    if sudo:
        cmd = f"echo '{VM_PASS}' | sudo -S bash -c \"{cmd}\""
    
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
    print(f"Connecting to {VM_USER}@{VM_IP}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        if VM_PASS:
            ssh.connect(VM_IP, username=VM_USER, password=VM_PASS, timeout=10)
        else:
            ssh.connect(VM_IP, username=VM_USER, timeout=10)
        print("Connected successfully!")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("\nIshlatish: python deploy_vm.py <VM_PAROL>")
        sys.exit(1)

    # 1. Loyiha papkasini yaratish
    run_command(ssh, f"mkdir -p {APP_DIR}")
    
    # 2. Git yangilash
    git_check = run_command(ssh, f"cd {APP_DIR} && git status")
    if git_check != 0:
        print(f"Cloning repo {REPO_URL} into {APP_DIR}...")
        run_command(ssh, f"git clone {REPO_URL} {APP_DIR}")
    else:
        print("Pulling latest changes from git...")
        run_command(ssh, f"cd {APP_DIR} && git fetch origin && git reset --hard origin/main")

    # 3. Mahalliy .env faylini serverga xavfsiz SFTP orqali yuklash
    local_env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(local_env_path):
        print(f"Uploading local .env file to {APP_DIR}/.env via SFTP...")
        sftp = ssh.open_sftp()
        sftp.put(local_env_path, f"{APP_DIR}/.env")
        sftp.close()
        run_command(ssh, f"cp {APP_DIR}/.env {APP_DIR}/.env.local")

    # 4. Bog'liqliklarni o'rnatish va build qilish
    run_command(ssh, f"cd {APP_DIR} && npm install")
    run_command(ssh, f"cd {APP_DIR} && npm run build")

    # 5. PM2 yoki Systemd servisini qayta ishga tushirish
    pm2_status = run_command(ssh, f"cd {APP_DIR} && npx pm2 restart techbozor || npx pm2 start npm --name 'techbozor' -- start")
    if pm2_status != 0:
        run_command(ssh, "systemctl restart techbozor", sudo=True)

    print("\n[SUCCESS] Deploy muvaffaqiyatli yakunlandi!")
    ssh.close()

if __name__ == '__main__':
    main()
