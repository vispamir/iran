# Production deployment

Pushes to main and manual Actions runs execute build then deploy on Node.js 22.
Build runs tests, production compilation, and TypeScript checks, and packages
standalone output with public assets, static chunks, and a REVISION file.
The build embeds NEXT_PUBLIC_SITE_URL=https://iranunfolded.com.

Repository secrets: DEPLOY_SSH_KEY and DEPLOY_KNOWN_HOSTS.
Repository variable: DEPLOY_HOST.
The dedicated iran-deploy SSH user uploads archives and can sudo only the
root-owned /usr/local/sbin/deploy-iranunfolded script. iran-app runs Node.js.
Never commit private keys or certificates.

Server files installed on giti-bot:
- deploy-release.sh -> /usr/local/sbin/deploy-iranunfolded (root, mode 755)
- iranunfolded.service -> /etc/systemd/system/iranunfolded.service (enabled)
- nginx.conf -> /etc/nginx/sites-available/iranunfolded.com (enabled)
- Cloudflare Origin certificate and key -> /etc/nginx/ssl/iranunfolded/ (mode 600)

Requires Node.js 22, Nginx, curl, tar, flock, sudo, and systemd.
/srv/iranunfolded/incoming is writable by iran-deploy and readable by iran-app.
Releases live at /srv/iranunfolded/releases/<sha>; current points to the active one.
Activation is serialized. A failed loopback health check restores the previous
release. Actions also verifies public HTTPS. Old releases are retained for rollback;
monitor disk use and prune inactive releases when needed.

Nginx permanently redirects HTTP and HTTPS www requests directly to
https://iranunfolded.com, preserving paths and query strings. Use Full (strict)
TLS at Cloudflare so HTTPS visitors reach the origin over HTTPS without loops.
Cloudflare Origin certificates are intended for Cloudflare-to-origin connections.

Inspect with systemctl status iranunfolded and journalctl -u iranunfolded.
To roll back manually, repoint current to a previous release and restart the service.
