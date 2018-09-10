#!/bin/bash

# CLI config
CLI_CORE_PEER_LOCALMSPID="Org1MSP"
CLI_CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.cts.net/users/Admin@org1.cts.net/msp"

# channels
PUBLIC_CHANNEL_NAME="public"

ORDERER_URL="orderer.cts.net:7050"
CLI_CONTAINER="cli.cts.net"

execPeerCommand()
{
    orgNumber="${1}"; shift
    peerNumber="${1}"; shift

    peerContainer="peer${peerNumber}.org${orgNumber}.cts.net"
    envLocalMspId="CORE_PEER_LOCALMSPID=Org${orgNumber}MSP"
    envMspConfigPath="CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org${orgNumber}.cts.net/msp"

    docker exec -e "$envLocalMspId" -e "$envMspConfigPath" "$peerContainer" "$@"
}

execCliCommand()
{
    docker exec -e "CORE_PEER_LOCALMSPID=${CLI_CORE_PEER_LOCALMSPID}" -e "CORE_PEER_MSPCONFIGPATH=${CLI_CORE_PEER_MSPCONFIGPATH}" "$CLI_CONTAINER" "$@"
}

deployChaincode()
{
    channelName="${1}"
    chaincodeName="${2}"
    
    execCliCommand "peer" "chaincode" "install" "-n" "$chaincodeName" "-v" "1.0" "-p" "github.com/cts"
    execCliCommand "peer" "chaincode" "instantiate" "-o" "$ORDERER_URL" "-C" "$channelName" "-n" "$chaincodeName" "-v" "1.0" "-c" "{\"Args\":[\"\"]}"
}

upgradeChaincode()
{
    channelName="${1}"
    chaincodeName="${2}"
    version="${3}"

    execCliCommand "peer" "chaincode" "install" "-n" "$chaincodeName" "-v" "$version" "-p" "github.com/cts"
    execCliCommand "peer" "chaincode" "upgrade" "-o" "$ORDERER_URL" "-C" "$channelName" "-n" "$chaincodeName" "-v" "$version" "-c" "{\"Args\":[\"\"]}"
}

chaincodeQuery()
{
    channelName="${1}"
    chaincodeName="${2}"
    commonArgs="${3}"
    transientArgs="${4}"

    cmdArgs=(
	"peer"
	"chaincode"
	"query"
	"-C"
	"$channelName"
	"-n"
	"$chaincodeName"
	"-c"
	"$commonArgs"
    )
    if [ "$transientArgs" ]
    then
	cmdArgs+=(
	    "--transient"
	    "$transientArgs"
	)
    fi
    execCliCommand "${cmdArgs[@]}"
}

chaincodeInvoke()
{
    channelName="${1}"
    chaincodeName="${2}"
    commonArgs="${3}"
    transientArgs="${4}"

    cmdArgs=(
	"peer"
	"chaincode"
	"invoke"
	"-o"
	"$ORDERER_URL"
	"-C"
	"$channelName"
	"-n"
	"$chaincodeName"
	"-c"
	"$commonArgs"
    )
    if [ "$transientArgs" ]
    then
	cmdArgs+=(
	    "--transient"
	    "$transientArgs"
	)
    fi
    execCliCommand "${cmdArgs[@]}"
}
