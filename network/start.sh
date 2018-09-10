#!/bin/bash

set -e

./stop-and-remove-chaindata.sh

echo "STARTING DOCKER CONTAINERS"
docker-compose -f docker-compose.yml up -d

# wait for Hyperledger Fabric to start
echo "WAITING HYPERLEDGER FABRIC"
sleep 10

source ./common.sh

queryArgs='["getProcessing", "УМКА"]'
chaincodeQuery "$PUBLIC_CHANNEL_NAME" "cross-transaction-system" $queryArgs "{}"
