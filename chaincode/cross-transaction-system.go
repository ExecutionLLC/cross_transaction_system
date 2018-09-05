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

type ExternalServiceInfo OperatorInfo

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
	MinBalanceLimit float32 `json:"minBalanceLimit"`
	MaxPerDayLimit float32 `json:"maxPerDayLimit"`
	Operators []*OperatorExtendedInfo `json:"operators"`
}

type ExternalServiceExtendedInfo struct{
	ServiceProcessingName string `json:"serviceProcessingName"`
	ServiceName string `json:"serviceName"`
	IsActive bool `json:"isActive"`	
}

type ProcessingExtendedInfo struct{
	Name string `json:"name"`
	Description string `json:"description"`
	Services []*ServiceExtendedInfo `json:"services"`
	ExternalServices []*ExternalServiceExtendedInfo `json:"externalServices"`
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
	return cts.addProcessing(APIstub, []string{"{\"name\": \"УМКА\", \"description\": \"Система оплаты проезда в общественном транспорте\"}"})
}

func (cts *CrossTransactionSystem) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response {
	functionName, functionArgs := APIstub.GetFunctionAndParameters()

	switch functionName {
	case "addProcessing":
		return cts.addProcessing(APIstub, functionArgs)
	case "addService":
		return cts.addService(APIstub, functionArgs)
	case "addOperator":
		return cts.addOperator(APIstub, functionArgs)
//	case "addWallet":
//		return cts.addWallet(APIstub, functionArgs)
//	case "addTransaction":
//		return cts.addTransaction(APIstub, functionArgs)
	case "isProcessingExists":
		return cts.isProcessingExists1(APIstub, functionArgs)
	case "isServiceExists":
		return cts.isServiceExists1(APIstub, functionArgs)
	case "isOperatorExists":
		return cts.isOperatorExists1(APIstub, functionArgs)
	case "getProcessing":
		return cts.getProcessing(APIstub, functionArgs)	
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
		return false, errors.New(fmt.Sprintf("Cannot get state: %s", err))
	}
	return value != nil, nil
}

func (cts *CrossTransactionSystem) isProcessingExists0(APIstub shim.ChaincodeStubInterface, name string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(PROCESSING_INDX, []string{name})
	if err != nil {
		return false, errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return cts.isItemExists(APIstub, key)
}

func boolToResponse(value bool) pb.Response {
	if value {
		return shim.Success([]byte("true"))
	}
	return shim.Success([]byte("false"))
}

func (cts *CrossTransactionSystem) isProcessingExists1(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}
	name := args[0]
	
	isExists, err := cts.isProcessingExists0(APIstub, name)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return boolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isServiceExists0(APIstub shim.ChaincodeStubInterface, processingName string, serviceName string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(SERVICES_INDX, []string{processingName, serviceName})
	if err != nil {
		return false, errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return cts.isItemExists(APIstub, key)
}

func (cts *CrossTransactionSystem) isServiceExists1(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Expected 2 parameters")
	}
	processingName := args[0]
	serviceName := args[1]
	
	isExists, err := cts.isServiceExists0(APIstub, processingName, serviceName)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return boolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isOperatorExists0(APIstub shim.ChaincodeStubInterface, serviceProcessingName string, serviceName string, processingName string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(OPERATORS_INDX, []string{serviceProcessingName, serviceName, processingName})
	if err != nil {
		return false, errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return cts.isItemExists(APIstub, key)
}

func (cts *CrossTransactionSystem) isOperatorExists1(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Expected 3 parameters")
	}
	serviceProcessingName := args[0]
	serviceName := args[1]
	processingName := args[2]
	
	isExists, err := cts.isOperatorExists0(APIstub, serviceProcessingName, serviceName, processingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return boolToResponse(isExists)
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

	var processingInfo ProcessingInfo
	err := json.Unmarshal([]byte(processingInfoString), &processingInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal processing info: %s", err))
	}
	key, err := APIstub.CreateCompositeKey(PROCESSING_INDX, []string{processingInfo.Name})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(APIstub, key, []byte(processingInfoString))
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
	var serviceInfo ServiceInfo
	err := json.Unmarshal([]byte(serviceInfoString), &serviceInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal service info: %s", err))
	}
	isExists, err := cts.isProcessingExists0(APIstub, serviceInfo.ParentProcessingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find parent processing")
	}
	key, err := APIstub.CreateCompositeKey(SERVICES_INDX, []string{serviceInfo.ParentProcessingName, serviceInfo.Name})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(APIstub, key, []byte(serviceInfoString))
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) addOperator(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	operatorInfoString := args[0]
	var operatorInfo OperatorInfo
	err := json.Unmarshal([]byte(operatorInfoString), &operatorInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal operator info: %s", err))
	}
	isExists, err := cts.isProcessingExists0(APIstub, operatorInfo.ParentProcessingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find parent processing")
	}
	isExists, err = cts.isServiceExists0(APIstub, operatorInfo.ServiceProcessingName, operatorInfo.ServiceName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Cannot find service")
	}

	operatorKey, err := APIstub.CreateCompositeKey(OPERATORS_INDX, []string{operatorInfo.ServiceProcessingName, operatorInfo.ServiceName, operatorInfo.ParentProcessingName})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	err = cts.putStateIfItemDoesNotExists(APIstub, operatorKey, []byte(operatorInfoString))
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
	err = cts.putStateIfItemDoesNotExists(APIstub, externalServicesKey, externalServiceInfoBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) getServices(APIstub shim.ChaincodeStubInterface, processingName string) ([]*ServiceExtendedInfo, error) {
	servicesIter, err := APIstub.GetStateByPartialCompositeKey(SERVICES_INDX, []string{processingName})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Cannot get services index: %s", err))
	}
	defer servicesIter.Close()

	servicesMap := make(map[string]*ServiceExtendedInfo)
	for servicesIter.HasNext() {
		serviceKV, err := servicesIter.Next()
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot read next service index value: %s", err))
		}
		serviceInfoBytes := serviceKV.GetValue()

		var serviceInfo ServiceInfo
		err = json.Unmarshal(serviceInfoBytes, &serviceInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot unmarshal service info: %s", err))
		}

		servicesMap[serviceInfo.Name] = &ServiceExtendedInfo{
			ServiceName: serviceInfo.Name,
			IsActive: serviceInfo.IsActive,
			MinBalanceLimit: serviceInfo.MinBalanceLimit,
			MaxPerDayLimit: serviceInfo.MaxPerDayLimit,
			Operators: make([]*OperatorExtendedInfo, 0),
		}
	}

	operatorsIter, err := APIstub.GetStateByPartialCompositeKey(OPERATORS_INDX, []string{processingName})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Cannot get operators index: %s", err))
	}
	defer operatorsIter.Close()

	for operatorsIter.HasNext() {
		operatorKV, err := operatorsIter.Next()
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot read next operator index value: %s", err))
		}
		operatorInfoBytes := operatorKV.GetValue()

		var operatorInfo OperatorInfo
		err = json.Unmarshal(operatorInfoBytes, &operatorInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot unmarshal operator info: %s", err))
		}
		operatorExtendedInfo := OperatorExtendedInfo{
			ProcessingName: operatorInfo.ParentProcessingName, 
			IsActive: operatorInfo.IsActive,
		}
		service, hasItem := servicesMap[operatorInfo.ServiceName]
		if !hasItem {
			return nil, errors.New("Cannot find service of operator")
		}
		service.Operators = append(service.Operators, &operatorExtendedInfo)
	}
	
	result := make([]*ServiceExtendedInfo, 0, len(servicesMap))
	for _, service := range servicesMap {
		result = append(result, service)
	}
	
	return result, nil
}

func (cts *CrossTransactionSystem) getExternalServices(APIstub shim.ChaincodeStubInterface, processingName string) ([]*ExternalServiceExtendedInfo, error) {
	externalServicesIter, err := APIstub.GetStateByPartialCompositeKey(EXTERNAL_SERVICES_INDEX, []string{processingName})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Cannot get external services index: %s", err))
	}
	defer externalServicesIter.Close()

	result := make([]*ExternalServiceExtendedInfo, 0)
	for externalServicesIter.HasNext() {
		externalServiceKV, err := externalServicesIter.Next()
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot read next external service index value: %s", err))
		}
		externalServiceInfoBytes := externalServiceKV.GetValue()

		var externalServiceInfo ExternalServiceInfo
		err = json.Unmarshal(externalServiceInfoBytes, &externalServiceInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot unmarshal external service info: %s", err))
		}
		externalServiceExtendedInfo := &ExternalServiceExtendedInfo{
			ServiceProcessingName: externalServiceInfo.ServiceProcessingName,
			ServiceName: externalServiceInfo.ServiceName,
			IsActive: externalServiceInfo.IsActive,
		}
		result = append(result, externalServiceExtendedInfo)
	}

	return result, nil
}

func (cts *CrossTransactionSystem) getProcessing(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	processingName := args[0]
	key, err := APIstub.CreateCompositeKey(PROCESSING_INDX, []string{processingName})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	processingInfoBytes, err := APIstub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get state: %s", err))
	}
	if processingInfoBytes == nil {
		return shim.Error("Cannot find processing")
	}
	var processingInfo ProcessingInfo
	err = json.Unmarshal([]byte(processingInfoBytes), &processingInfo)
	if err != nil {
		return shim.Error("Cannot unmarshal processing")
	}

	services, err := cts.getServices(APIstub, processingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	externalServices, err := cts.getExternalServices(APIstub, processingName)
	if err != nil {
		return shim.Error(err.Error())
	}

	processingExtendedInfo := ProcessingExtendedInfo{
		Name: processingName,
		Description: processingInfo.Description,
		Services: services,
		ExternalServices: externalServices,
	}
	processingExtendedInfoBytes, err := json.Marshal(processingExtendedInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot marshal processing info: %s", err))		
	}

	return shim.Success(processingExtendedInfoBytes)
}

func main() {
	err := shim.Start(&CrossTransactionSystem{})
	if err != nil {
		fmt.Printf("Error starting CrossTransactionSystem chaincode: %s", err)
	}
}
