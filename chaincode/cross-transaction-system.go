package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type ProcessingInfo{
	Name string `json:"name"`
	Description string `json:"description"`
}

type ServiceInfo{
	NativeProcessingName string `json:"nativeProcessingName"`
	Name string `json:"name"`
	Description string `json:"description"`
	MinBalanceLimit float32 `json:"minBalanceLimit"`
	MaxPerDayLimit float32 `json:"maxPerDayLimit"`
	IsActive bool `json:"isActive"`
}

type WalletInfo{
	ID string `json:"id"`
	Balance float32 `json:"balance"`
}

const (
	INTERNAL_SERVICE_RELATION_TYPE = "INTERNAL"
	EXTERNAL_SERVICE_RELATION_TYPE = "EXTERNAL"
	
	PROCESSING_INDX = "processingName"
	SERVICES_INDX = "processingName~relationType~serviceName"
	OPERATORS_INDX = "serviceName~processingName"
	WALLETS_INDX = "processingName~walletID"

	WALLET_TRANSACTIONS_INDX = "processingName~walletID~transactionID"
	CROSS_PROCESSING_TRANSACTIONS_INDX = "sourceProcessingName~destinationProcessingName~transactionID"
	SERVICE_TRANSACTIONS_INDX = "processingName~serviceName~transactionID"
)

type CrossTransactionSystem struct {
}

func (cts *CrossTransactionSystem) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response {
	functionName, functionArgs := APIstub.GetFunctionAndParameters()

	switch functionName {
	case "addProcessing":
		return cts.addProcessing(APIstub, functionArgs)
	case "addService":
		return cts.addService(APIstub, functionArgs)
	case "addOperator"
		return cts.addOperator(APIstub, functionArgs)
	case "addWallet":
		return cts.addWallet(APIstub, functionArgs)
	case "addTransaction":
		return cts.addTransaction(APIstub, functionArgs)
	case "getProcessing":
		return cts.getProcessing(APIstub, functionArgs)
	case "getService":
		return cts.getService(APIstub, functionArgs)
	case "setServiceState":
		return cts.setServiceState(APIstub, functionArgs)
	case "setOperatorState":
		return cts.setOperatorState(APIstub, functionArgs)
	}

	return shim.Error(fmt.Sprintf("Got unknown function name (%s).", functionName))
}

func (cts *CrossTransactionSystem) putStateIfItemDoesNotExists(APIstub shim.ChaincodeStubInterface, key string, value []byte) error {
	currentValue, err := APIstub.GetState(key)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot get state: %s", err))
	}
	if currentValue != nil {
		return errors.New("Item already exists")
	}
	err = APIstub.PutState(key, value)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot put state: %s", err))
	}

	return nil
}

func (cts *CrossTransactionSystem) addProcessing(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	processingInfoString := args[0]
	processingInfo ProcessingInfo
	err := json.Unmarshal([]byte(processingInfoString), &processingInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal processing info: %s", err))
	}
	key, err := APIstub.CreateCompositeKey(PROCESSING_INDX, []string{processingInfo.Name})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(key, []byte(processingInfoString))
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(nil)
}

func main() {
	err := shim.Start(&CrossTransactionSystem{})
	if err != nil {
		fmt.Printf("Error starting CrossTransactionSystem chaincode: %s", err)
	}
}
