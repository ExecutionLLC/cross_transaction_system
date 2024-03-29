#!/bin/bash

set -e

./stop-and-remove-chaindata.sh

echo "STARTING DOCKER CONTAINERS"
docker-compose -f docker-compose.yml up -d

# wait for Hyperledger Fabric to start
echo "WAITING HYPERLEDGER FABRIC"
sleep 10

source ./common.sh

execPeerCommand "1" "0" "peer" "channel" "create" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/${PUBLIC_CHANNEL_NAME}_channel.tx"
execPeerCommand "1" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"
execPeerCommand "1" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org1_${PUBLIC_CHANNEL_NAME}_anchors.tx"

execPeerCommand "2" "0" "peer" "channel" "fetch" "0" "${PUBLIC_CHANNEL_NAME}.block" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME"
execPeerCommand "2" "0" "peer" "channel" "join" "-b" "${PUBLIC_CHANNEL_NAME}.block"
execPeerCommand "2" "0" "peer" "channel" "update" "-o" "$ORDERER_URL" "-c" "$PUBLIC_CHANNEL_NAME" "-f" "/etc/hyperledger/configtx/Org2_${PUBLIC_CHANNEL_NAME}_anchors.tx"

deployChaincode "$PUBLIC_CHANNEL_NAME" "cross-transaction-system"

