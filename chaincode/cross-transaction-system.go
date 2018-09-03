package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type ProcessingInfo struct{
	Name string `json:"name"`
	Description string `json:"description"`
}

type ServiceInfo struct{
	ParentProcessingName string `json:"parentProcessingName"`
	Name string `json:"name"`
	Description string `json:"description"`
	MinBalanceLimit float32 `json:"minBalanceLimit"`
	MaxPerDayLimit float32 `json:"maxPerDayLimit"`
	IsActive bool `json:"isActive"`
}

type OperatorInfo struct{
	ServiceProcessingName string `json:"serviceProcessingName"`
	ServiceName string `json:"serviceName"`
	ParentProcessingName string `json:"parentProcessingName"`
	IsActive bool `json:"isActive"`
}

type WalletInfo struct{
	ID string `json:"id"`
	Balance float32 `json:"balance"`
}

type OperatorExtendedInfo struct{
	ProcessingName string `json:"processingName"`
	IsActive bool `json:"isActive"`
}

type ServiceExtendedInfo struct{
	ServiceName string `json:"serviceName"`
	IsActive bool `json:"isActive"`
	Operators []OperatorExtendedInfo `json:"operators"`
}

type ExternalServiceExtendedInfo struct{
	ServiceName string `json:"serviceName"`
	IsActive bool `json:"isActive"`	
}

type ProcessingExtendedInfo struct{
	Name string `json:"name"`
	Description string `json:"description"`
	Services []ServiceExtendedInfo `json:"services"`
	ExternalServices []ExternalServiceExtendedInfo `json:"externalServices"`
}

const (
	PROCESSING_INDX = "processingName"
	SERVICES_INDX = "serviceProcessingName~serviceName"
	EXTERNAL_SERVICES_INDEX = "processingName~serviceProcessingName~serviceName"
	OPERATORS_INDX = "serviceProcessingName~serviceName~processingName"
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
//	case "addWallet":
//		return cts.addWallet(APIstub, functionArgs)
//	case "addTransaction":
//		return cts.addTransaction(APIstub, functionArgs)
	case "getProcessing":
		return cts.getProcessing(APIstub, functionArgs)
//	case "getService":
//		return cts.getService(APIstub, functionArgs)
//	case "setServiceState":
//		return cts.setServiceState(APIstub, functionArgs)
//	case "setOperatorState":
//		return cts.setOperatorState(APIstub, functionArgs)
	}

	return shim.Error(fmt.Sprintf("Got unknown function name (%s).", functionName))
}

func (cts *CrossTransactionSystem) isItemExists(APIstub shim.ChaincodeStubInterface, key string) (bool, error) {
	value, err := APIstub.GetState(key)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot get state: %s", err))
	}
	return value != nil
}

func (cts *CrossTransactionSystem) isProcessingExists(APIstub shim.ChaincodeStubInterface, name string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(PROCESSING_INDX, []string{name})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return cts.isItemExists(APIstub, key)
}

func (cts *CrossTransactionSystem) isServiceExists(APIstub shim.ChaincodeStubInterface, processingName string, serviceName string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(SERVICE_INDX, []string{processingName, serviceName})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return cts.isItemExists(APIstub, key)
}

func (cts *CrossTransactionSystem) putStateIfItemDoesNotExists(APIstub shim.ChaincodeStubInterface, key string, value []byte) error {
	isExists, err := cts.isItemExists(APIstub, key)
	if err != nil {
		return err
	}
	if isExists {
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

func (cts *CrossTransactionSystem) addService(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	serviceInfoString := args[0]
	serviceInfo ServiceInfo
	err := json.Unmarshal([]byte(serviceInfoString), &serviceInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal service info: %s", err))
	}
	isExists, err := cts.isProcessingExists(APIstub, serviceInfo.ParentProcessingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find parent processing")
	}
	key, err := APIstub.CreateCompositeKey(SERVICE_INDX, []string{serviceInfo.ParentProcessingName, serviceInfo.Name})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(key, []byte(serviceInfoString))
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) addOperator(APIstub, functionArgs) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	operatorInfoString := args[0]
	operatorInfo OperatorInfo
	err := json.Unmarshal([]byte(operatorInfoString), &operatorInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal operator info: %s", err))
	}
	isExists, err := cts.isProcessingExists(APIstub, operatorInfo.ParentProcessingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find parent processing")
	}
	isExists, err = cts.isServiceExists(APIstub, operatorInfo.ServiceProcessingName, operatorInfo.ServiceName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find service")
	}

	operatorKey, err := APIstub.CreateCompositeKey(OPERATOR_INDX, []string{operatorInfo.ServiceProcessingName, operatorInfo.ServiceName, operatorInfo.ParentProcessingName})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(operatorKey, []byte(operatorInfoString))
	if err != nil {
		return shim.Error(err.Error())
	}

	externalServicesKey, err := APIstub.CreateCompositeKey(EXTERNAL_SERVICES_INDEX, []string{operatorInfo.ParentProcessingName, operatorInfo.ServiceProcessingName, operatorInfo.ServiceName})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	operatorInfo.IsActive = false
	externalServiceInfoBytes, err := json.Marshal(operatorInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot marshal external service info: %s", err))		
	}
	err = cts.putStateIfItemDoesNotExists(externalServicesKey, externalServiceInfoBytes)
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
