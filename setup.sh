#!/usr/bin/env bash
set -euo pipefail

python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
pip install -r backend/requirements.txt
