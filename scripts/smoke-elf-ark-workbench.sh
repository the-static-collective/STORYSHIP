#!/usr/bin/env bash
# Host-process interoperability smoke only. NOT cold boot, VM, isolated guest, or OpenManus.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
workbench_sha=38c6b13747f62b70961b93a0124a06ebd2932f20
tmp="$(mktemp -d)"
trap 'rm -rf -- "$tmp"' EXIT
git init -q "$tmp/workbench"
git -C "$tmp/workbench" remote add origin https://github.com/the-static-collective/static-workbench.git
git -C "$tmp/workbench" fetch -q --depth=1 origin "$workbench_sha"
test "$(git -C "$tmp/workbench" rev-parse FETCH_HEAD)" = "$workbench_sha"
git -C "$tmp/workbench" checkout -q --detach "$workbench_sha"

mkdir "$tmp/first" "$tmp/occurrences-1" "$tmp/occurrences-2"
printf 'seed becomes signal\n' > "$tmp/first/input.txt"
python3 - "$tmp/first/input.txt" "$tmp/seed-1.json" <<'PY'
import hashlib, json, pathlib, sys
raw = pathlib.Path(sys.argv[1]).read_bytes()
pathlib.Path(sys.argv[2]).write_text(json.dumps({
    "schema":"static.genesis-elf-seed/v0",
    "operation":"uppercase_ascii",
    "input_sha256":hashlib.sha256(raw).hexdigest(),
    "parent_receipt_sha256":None
}) + "\n", encoding="utf-8")
PY
first="$(PYTHONPATH="$tmp/workbench" python3 -m static_workbench.elf_genesis hatch \
  --seed "$tmp/seed-1.json" --workspace "$tmp/first" --output "$tmp/occurrences-1")"
PYTHONPATH="$tmp/workbench" python3 -m static_workbench.elf_genesis verify \
  --seed "$tmp/seed-1.json" --workspace "$tmp/first" --output "$first" > "$tmp/verified-1.json"
node "$root/cli/elf-ark.mjs" seal --occurrence "$first" --destination "$tmp/ark-source" > "$tmp/sealed.json"
# Explicit manual copy stand-in; a CI copy is not a cold-boot or persistent-disk witness.
cp -a "$tmp/ark-source" "$tmp/ark-transferred"
node "$root/cli/elf-ark.mjs" verify --ark "$tmp/ark-transferred" > "$tmp/verified-ark.json"
node "$root/cli/elf-ark.mjs" receive --ark "$tmp/ark-transferred" \
  --destination "$tmp/received" > "$tmp/arrival.json"
second="$(PYTHONPATH="$tmp/workbench" python3 -m static_workbench.elf_genesis hatch \
  --seed "$tmp/received/seed.json" --workspace "$tmp/received" --output "$tmp/occurrences-2")"
PYTHONPATH="$tmp/workbench" python3 -m static_workbench.elf_genesis verify \
  --seed "$tmp/received/seed.json" --workspace "$tmp/received" --output "$second" \
  --parent-receipt "$tmp/received/parent-receipt.json" > "$tmp/verified-2.json"
python3 - "$tmp" "$first" "$second" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
first, second = pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
assert first.name != second.name
assert json.loads((root/"verified-1.json").read_text())["verified"] is True
assert json.loads((root/"verified-2.json").read_text())["verified"] is True
assert json.loads((root/"arrival.json").read_text())["elf_hatched"] is False
assert json.loads((root/"arrival.json").read_text())["authority"] == "none"
assert json.loads((root/"sealed.json").read_text())["ark_id"] == json.loads((root/"verified-ark.json").read_text())["ark_id"]
assert (first/"artifact.txt").read_bytes() == (second/"artifact.txt").read_bytes()
print("PASS: exact-pinned Workbench -> Storyship Ark -> fresh Workbench occurrence")
print("NONCLAIMS: VM boot NOT RUN; cold boot NOT RUN; OpenManus NOT RUN")
PY
