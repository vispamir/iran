#!/usr/bin/env bash
set -euo pipefail
revision="${1:-}"
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 2
exec 9>/srv/iranunfolded/deploy.lock
flock -x 9
base=/srv/iranunfolded
release="$base/releases/$revision"
previous=$(readlink -f "$base/current" || true)
[[ ! -e "$release" ]] || { echo 'Release already exists'; exit 1; }
install -d -o iran-app -g iran-app "$release"
runuser -u iran-app -- tar -xzf "$base/incoming/$revision.tar.gz" -C "$release" --no-same-owner
[[ "$(cat "$release/REVISION")" == "$revision" ]]
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
systemctl restart iranunfolded
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3108/ -o /dev/null; then
    rm -f "$base/incoming/$revision.tar.gz"
    echo "Deployed $revision"
    exit 0
  fi
  sleep 2
done
if [[ -n "$previous" && -d "$previous" ]]; then
  ln -sfn "$previous" "$base/current.next"
  mv -Tf "$base/current.next" "$base/current"
  systemctl restart iranunfolded
fi
journalctl -u iranunfolded -n 30 --no-pager
exit 1
