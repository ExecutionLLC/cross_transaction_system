#!/bin/bash

source ./common.sh

docker-compose -f docker-compose.yml stop cli.cts.net
docker-compose -f docker-compose.yml start cli.cts.net

upgradeChaincode "$PUBLIC_CHANNEL_NAME" "cross-transaction-system" "$1"
