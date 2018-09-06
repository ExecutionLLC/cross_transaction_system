package main

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type ProcessingInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ServiceInfo struct {
	ParentProcessingName string  `json:"parentProcessingName"`
	Name                 string  `json:"name"`
	Description          string  `json:"description"`
	MinBalanceLimit      float32 `json:"minBalanceLimit"`
	MaxPerDayLimit       float32 `json:"maxPerDayLimit"`
	IsActive             bool    `json:"isActive"`
}

type OperatorInfo struct {
	ServiceProcessingName string `json:"serviceProcessingName"`
	ServiceName           string `json:"serviceName"`
	ParentProcessingName  string `json:"parentProcessingName"`
	IsActive              bool   `json:"isActive"`
}

type ExternalServiceInfo OperatorInfo

type OperatorExtendedInfo struct {
	ProcessingName          string `json:"processingName"`
	IsActive                bool   `json:"isActive"`
	ExternalServiceIsActive bool   `json:"externalServiceIsActive"`
}

type ServiceExtendedInfo struct {
	ServiceName     string                  `json:"serviceName"`
	Description     string                  `json:"description"`
	IsActive        bool                    `json:"isActive"`
	MinBalanceLimit float32                 `json:"minBalanceLimit"`
	MaxPerDayLimit  float32                 `json:"maxPerDayLimit"`
	Operators       []*OperatorExtendedInfo `json:"operators"`
}

type ExternalServiceExtendedInfo struct {
	ServiceProcessingName  string  `json:"serviceProcessingName"`
	ServiceName            string  `json:"serviceName"`
	ServiceDescription     string  `json:"serviceDescription"`
	ServiceIsActive        bool    `json:"serviceIsActive"`
	ServiceMinBalanceLimit float32 `json:"serviceMinBalanceLimit"`
	ServiceMaxPerDayLimit  float32 `json:"serviceMaxPerDayLimit"`
	IsActive               bool    `json:"isActive"`
}

type ProcessingExtendedInfo struct {
	Name             string                         `json:"name"`
	Description      string                         `json:"description"`
	Services         []*ServiceExtendedInfo         `json:"services"`
	ExternalServices []*ExternalServiceExtendedInfo `json:"externalServices"`
}

type WalletInfo struct {
	ProcessingName string  `json:"processingName"`
	ID             string  `json:"id"`
	Balance        float32 `json:"balance"`
}

type WalletExtendedInfo struct {
	ProcessingName     string         `json:"processingName"`
	ID                 string         `json:"id"`
	Balance            float32        `json:"balance"`
	BalanceVirtualDiff float32        `json:"balanceVirtualDiff"`
	TransactionsOffset uint32         `json:"transactionsOffset"`
	TransactionsLimit  uint32         `json:"transactionsLimit"`
	Transactions       []*Transaction `json:"transactions"`
}

type Transaction struct {
	ID                    string  `json:"id"`
	ProcessingName        string  `json:"processingName"`
	ServiceName           string  `json:"serviceName"`
	OperatorName          string  `json:"operatorName"`
	WalletID              string  `json:"walletId"`
	Timestamp             int64   `json:"timestamp"`
	ExternalTransactionID string  `json:"externalTransactionId"`
	Amount                float32 `json:"amount"`
	Comment               string  `json:"comment"`
}

const (
	PROCESSING_INDX        = "processingName"
	SERVICES_INDX          = "serviceProcessingName~serviceName"
	EXTERNAL_SERVICES_INDX = "processingName~serviceProcessingName~serviceName"
	OPERATORS_INDX         = "serviceProcessingName~serviceName~processingName"
	WALLETS_INDX           = "processingName~walletID"

	TRANSACTIONS_INDX           = "transactionID"
	WALLET_VIRTUAL_BALANCE_INDX = "processingName~walletID~transactionID"
	WALLET_TRANSACTIONS_INDX    = "processingName~walletID~date~time~transactionID"

	INTERNAL_TRANSACTIONS_INDX = "processingName~date~time~transactionID"
	SRC_DST_TRANSACTIONS_INDX  = "sourceProcessingName~destinationProcessingName~date~time~transactionID"
	DST_SRC_TRANSACTIONS_INDX  = "destinationProcessingName~sourceProcessingName~date~time~transactionID"
)

type CrossTransactionSystem struct {
}

func (cts *CrossTransactionSystem) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	cts.addProcessing(APIstub, []string{"{\"name\": \"УМКА\", \"description\": \"Система оплаты проезда в общественном транспорте\"}"})
	cts.addProcessing(APIstub, []string{"{\"name\": \"Кофеман\", \"description\": \"Сеть венденговых кофемашин г.Рязань\"}"})
	cts.addProcessing(APIstub, []string{"{\"name\": \"Мясоруб\", \"description\": \"Сеть ресторанов быстрого питания\"}"})
	cts.addProcessing(APIstub, []string{"{\"name\": \"33 Пингвина\", \"description\": \"Сеть киосков по продаже мороженого\"}"})

	return shim.Success(nil)
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
	case "addWallet":
		return cts.addWallet(APIstub, functionArgs)
	case "addTransaction":
		return cts.addTransaction(APIstub, functionArgs)
	case "isProcessingExists":
		return cts.isProcessingExists1(APIstub, functionArgs)
	case "isServiceExists":
		return cts.isServiceExists1(APIstub, functionArgs)
	case "isOperatorExists":
		return cts.isOperatorExists1(APIstub, functionArgs)
	case "isExternalServiceExists":
		return cts.isExternalServiceExists1(APIstub, functionArgs)
	case "isWalletExists":
		return cts.isWalletExists1(APIstub, functionArgs)
	case "getProcessing":
		return cts.getProcessing(APIstub, functionArgs)
	case "setServiceState":
		return cts.setServiceState(APIstub, functionArgs)
	case "setOperatorState":
		return cts.setOperatorState(APIstub, functionArgs)
	case "setExternalServiceState":
		return cts.setExternalServiceState(APIstub, functionArgs)
	case "getOperatorsList":
		return cts.getOperatorsList(APIstub, functionArgs)
	}

	return shim.Error(fmt.Sprintf("Got unknown function name (%s).", functionName))
}

func (cts *CrossTransactionSystem) isProcessingExists0(APIstub shim.ChaincodeStubInterface, name string) (bool, error) {
	return CheckItemExistanceByCompositeKey(APIstub, PROCESSING_INDX, []string{name})
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

	return BoolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isServiceExists0(APIstub shim.ChaincodeStubInterface, processingName string, serviceName string) (bool, error) {
	return CheckItemExistanceByCompositeKey(APIstub, SERVICES_INDX, []string{processingName, serviceName})
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

	return BoolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isOperatorExists0(APIstub shim.ChaincodeStubInterface, serviceProcessingName string, serviceName string, processingName string) (bool, error) {
	return CheckItemExistanceByCompositeKey(APIstub, OPERATORS_INDX, []string{serviceProcessingName, serviceName, processingName})
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

	return BoolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isExternalServiceExists0(APIstub shim.ChaincodeStubInterface, serviceProcessingName string, serviceName string, processingName string) (bool, error) {
	return CheckItemExistanceByCompositeKey(APIstub, EXTERNAL_SERVICES_INDX, []string{processingName, serviceProcessingName, serviceName})
}

func (cts *CrossTransactionSystem) isExternalServiceExists1(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Expected 3 parameters")
	}
	serviceProcessingName := args[0]
	serviceName := args[1]
	processingName := args[2]

	isExists, err := cts.isExternalServiceExists0(APIstub, serviceProcessingName, serviceName, processingName)
	if err != nil {
		return shim.Error(err.Error())
	}

	return BoolToResponse(isExists)
}

func (cts *CrossTransactionSystem) isWalletExists0(APIstub shim.ChaincodeStubInterface, processingName string, walletID string) (bool, error) {
	return CheckItemExistanceByCompositeKey(APIstub, WALLETS_INDX, []string{processingName, walletID})
}

func (cts *CrossTransactionSystem) isWalletExists1(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Expected 2 parameters")
	}
	processingName := args[0]
	walletID := args[1]

	isExists, err := cts.isWalletExists0(APIstub, processingName, walletID)
	if err != nil {
		return shim.Error(err.Error())
	}

	return BoolToResponse(isExists)
}

func (cts *CrossTransactionSystem) putStateIfItemDoesNotExists(APIstub shim.ChaincodeStubInterface, key string, value []byte) error {
	isExists, err := CheckItemExistanceByKey(APIstub, key)
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
	isExists, err := cts.isServiceExists0(APIstub, operatorInfo.ServiceProcessingName, operatorInfo.ServiceName)
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

	externalServicesKey, err := APIstub.CreateCompositeKey(EXTERNAL_SERVICES_INDX, []string{operatorInfo.ParentProcessingName, operatorInfo.ServiceProcessingName, operatorInfo.ServiceName})
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
			ServiceName:     serviceInfo.Name,
			Description:     serviceInfo.Description,
			IsActive:        serviceInfo.IsActive,
			MinBalanceLimit: serviceInfo.MinBalanceLimit,
			MaxPerDayLimit:  serviceInfo.MaxPerDayLimit,
			Operators:       make([]*OperatorExtendedInfo, 0),
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

		var externalServiceInfo ExternalServiceInfo
		externalServiceKeyArgs := []string{operatorInfo.ParentProcessingName, processingName, operatorInfo.ServiceName}
		err = GetItemByCompositeKey(APIstub, EXTERNAL_SERVICES_INDX, externalServiceKeyArgs, &externalServiceInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot get external service: %s", err))
		}
		operatorExtendedInfo := OperatorExtendedInfo{
			ProcessingName:          operatorInfo.ParentProcessingName,
			IsActive:                operatorInfo.IsActive,
			ExternalServiceIsActive: externalServiceInfo.IsActive,
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
	externalServicesIter, err := APIstub.GetStateByPartialCompositeKey(EXTERNAL_SERVICES_INDX, []string{processingName})
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
		var serviceInfo ServiceInfo
		serviceKeyArgs := []string{externalServiceInfo.ServiceProcessingName, externalServiceInfo.ServiceName}
		err = GetItemByCompositeKey(APIstub, SERVICES_INDX, serviceKeyArgs, &serviceInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot get service: %s", err))
		}
		var operatorInfo OperatorInfo
		operatorKeyArgs := []string{externalServiceInfo.ServiceProcessingName, externalServiceInfo.ServiceName, processingName}
		err = GetItemByCompositeKey(APIstub, OPERATORS_INDX, operatorKeyArgs, &operatorInfo)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Cannot get operator: %s", err))
		}
		externalServiceExtendedInfo := &ExternalServiceExtendedInfo{
			ServiceProcessingName:  externalServiceInfo.ServiceProcessingName,
			ServiceName:            externalServiceInfo.ServiceName,
			IsActive:               externalServiceInfo.IsActive,
			ServiceDescription:     serviceInfo.Description,
			ServiceIsActive:        serviceInfo.IsActive && operatorInfo.IsActive,
			ServiceMinBalanceLimit: serviceInfo.MinBalanceLimit,
			ServiceMaxPerDayLimit:  serviceInfo.MaxPerDayLimit,
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

	var processingInfo ProcessingInfo
	err := GetItemByCompositeKey(APIstub, PROCESSING_INDX, []string{processingName}, &processingInfo)
	if err != nil {
		return shim.Error(err.Error())
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
		Name:             processingName,
		Description:      processingInfo.Description,
		Services:         services,
		ExternalServices: externalServices,
	}
	processingExtendedInfoBytes, err := json.Marshal(processingExtendedInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot marshal processing info: %s", err))
	}

	return shim.Success(processingExtendedInfoBytes)
}

func (cts *CrossTransactionSystem) setServiceState(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Expected 3 parameter")
	}

	processingName := args[0]
	serviceName := args[1]
	newStateString := args[2]

	newState := StringToBool(newStateString)

	var serviceInfo ServiceInfo
	err := GetItemByCompositeKey(APIstub, SERVICES_INDX, []string{processingName, serviceName}, &serviceInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	if serviceInfo.IsActive == newState {
		return shim.Success(nil)
	}

	serviceInfo.IsActive = newState
	err = PutItemByCompositeKey(APIstub, SERVICES_INDX, []string{processingName, serviceName}, serviceInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) setOperatorState(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Expected 4 parameter")
	}

	serviceProcessingName := args[0]
	serviceName := args[1]
	parentProcessingName := args[2]
	newStateString := args[3]

	newState := StringToBool(newStateString)

	var operatorInfo OperatorInfo
	err := GetItemByCompositeKey(APIstub, OPERATORS_INDX, []string{serviceProcessingName, serviceName, parentProcessingName}, &operatorInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	if operatorInfo.IsActive == newState {
		return shim.Success(nil)
	}

	operatorInfo.IsActive = newState
	err = PutItemByCompositeKey(APIstub, OPERATORS_INDX, []string{serviceProcessingName, serviceName, parentProcessingName}, operatorInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) setExternalServiceState(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Expected 4 parameter")
	}

	serviceProcessingName := args[0]
	serviceName := args[1]
	parentProcessingName := args[2]
	newStateString := args[3]

	newState := StringToBool(newStateString)

	var externalServiceInfo ExternalServiceInfo
	err := GetItemByCompositeKey(APIstub, EXTERNAL_SERVICES_INDX, []string{parentProcessingName, serviceProcessingName, serviceName}, &externalServiceInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	if externalServiceInfo.IsActive == newState {
		return shim.Success(nil)
	}

	externalServiceInfo.IsActive = newState
	err = PutItemByCompositeKey(APIstub, EXTERNAL_SERVICES_INDX, []string{parentProcessingName, serviceProcessingName, serviceName}, externalServiceInfo)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) getOperatorsList(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	processingName := args[0]

	processingIter, err := APIstub.GetStateByPartialCompositeKey(PROCESSING_INDX, []string{})
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot get processing index: %s", err))
	}
	defer processingIter.Close()

	result := make([]*ProcessingInfo, 0)
	for processingIter.HasNext() {
		processingKV, err := processingIter.Next()
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot read next processing index value: %s", err))
		}

		processingInfoBytes := processingKV.GetValue()

		var processingInfo ProcessingInfo
		err = json.Unmarshal(processingInfoBytes, &processingInfo)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot unmarshal processing info: %s", err))
		}

		if processingName != processingInfo.Name {
			result = append(result, &processingInfo)
		}
	}

	resultAsBytes, err := json.Marshal(result)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot marshal list of processings: %s", err))
	}

	return shim.Success(resultAsBytes)
}

func (cts *CrossTransactionSystem) getWalletExtendedInfo(APIstub shim.ChaincodeStubInterface, processingName string, walletID string, offset uint32, limit uint32) (WalletExtendedInfo, error) {
	var result WalletExtendedInfo

	var walletInfo WalletInfo
	err := GetItemByCompositeKey(APIstub, WALLETS_INDX, []string{processingName, walletID}, &walletInfo)
	if err != nil {
		return result, errors.New(fmt.Sprintf("Cannot get wallet: %s", err))
	}
	result.ID = walletInfo.ID
	result.Balance = walletInfo.Balance
	result.BalanceVirtualDiff = 0
	result.Transactions = make([]*Transaction, 0)

	virtualBalanceIter, err := APIstub.GetStateByPartialCompositeKey(WALLET_VIRTUAL_BALANCE_INDX, []string{processingName, walletID})
	if err != nil {
		return result, errors.New(fmt.Sprintf("Cannot get virtual balance index: %s", err))
	}
	defer virtualBalanceIter.Close()

	for virtualBalanceIter.HasNext() {
		virtualBalanceKV, err := virtualBalanceIter.Next()
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot read next virtual balance index value: %s", err))
		}
		virtualBalanceBytes := virtualBalanceKV.GetValue()
		result.BalanceVirtualDiff += Float32frombytes(virtualBalanceBytes)
	}

	if limit != 0 {
		transactionsIter, err := APIstub.GetStateByPartialCompositeKey(WALLET_TRANSACTIONS_INDX, []string{processingName, walletID})
		if err != nil {
			return result, errors.New(fmt.Sprintf("Cannot get virtual balance index: %s", err))
		}
		defer transactionsIter.Close()

		var position uint32
		position = 0
		for transactionsIter.HasNext() {
			transactionKV, err := transactionsIter.Next()

			position += 1
			if position <= offset {
				continue
			}

			key := transactionKV.GetKey()
			_, keyParts, err := APIstub.SplitCompositeKey(key)
			if err != nil {
				return result, errors.New(fmt.Sprintf("Cannot split composite key: %s", err))
			}
			transactionID := keyParts[4]

			var transaction Transaction
			err = GetItemByCompositeKey(APIstub, TRANSACTIONS_INDX, []string{transactionID}, &transaction)
			if err != nil {
				return result, errors.New(fmt.Sprintf("Cannot get transaction: %s", err))
			}
			result.Transactions = append(result.Transactions, &transaction)
			if uint32(len(result.Transactions)) >= limit {
				break
			}
		}
	}

	return result, err
}

func (cts *CrossTransactionSystem) addTransaction(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	transactionAsString := args[0]

	var transaction Transaction
	err := json.Unmarshal([]byte(transactionAsString), &transaction)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal transaction: %s", err))
	}

	processingName := transaction.OperatorName
	serviceProcessingName := transaction.ProcessingName
	serviceName := transaction.ServiceName
	dateString, timeString := TimestampToDateAndTimeStrings(transaction.Timestamp)
	transactionID := APIstub.GetTxID()
	amountAsBytes := Float32bytes(transaction.Amount)
	walletID := transaction.WalletID

	transaction.ID = transactionID

	if transaction.ProcessingName != transaction.OperatorName {
		var serviceInfo ServiceInfo
		var operatorInfo OperatorInfo
		var externalServiceInfo ExternalServiceInfo

		err = GetItemByCompositeKey(APIstub, SERVICES_INDX, []string{serviceProcessingName, serviceName}, &serviceInfo)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot get service: %s", err))
		}
		err = GetItemByCompositeKey(APIstub, OPERATORS_INDX, []string{serviceProcessingName, serviceName, processingName}, &operatorInfo)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot get operator: %s", err))
		}
		err = GetItemByCompositeKey(APIstub, EXTERNAL_SERVICES_INDX, []string{processingName, serviceProcessingName, serviceName}, &externalServiceInfo)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot get external service: %s", err))
		}

		if !serviceInfo.IsActive || !operatorInfo.IsActive || !externalServiceInfo.IsActive {
			return shim.Error("Transaction blocked (service, operator and external service must be active)")
		}

		walletExtendedInfo, err := cts.getWalletExtendedInfo(APIstub, serviceProcessingName, walletID, 0, 0)
		if err != nil {
			return shim.Error(err.Error())
		}
		currentBalance := walletExtendedInfo.Balance
		currentBalance += walletExtendedInfo.BalanceVirtualDiff
		if currentBalance < serviceInfo.MinBalanceLimit {
			return shim.Error("Transaction blocked (currentBalance < MinBalanceLimit)")
		}

		err = PutStateByCompositeKey(APIstub, WALLET_TRANSACTIONS_INDX, []string{processingName, walletID, transactionID}, amountAsBytes)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot put virtual balance: %s", err))
		}

		err = PutStateByCompositeKey(APIstub, SRC_DST_TRANSACTIONS_INDX, []string{processingName, serviceProcessingName, dateString, timeString, transactionID}, amountAsBytes)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot update src dst transactions index: %s", err))
		}
		err = PutStateByCompositeKey(APIstub, DST_SRC_TRANSACTIONS_INDX, []string{serviceProcessingName, processingName, dateString, timeString, transactionID}, amountAsBytes)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot update dst src transactions index: %s", err))
		}
	} else {
		err = PutStateByCompositeKey(APIstub, INTERNAL_TRANSACTIONS_INDX, []string{processingName, dateString, timeString, transactionID}, amountAsBytes)
		if err != nil {
			return shim.Error(fmt.Sprintf("Cannot update internal transactions index: %s", err))
		}
	}

	err = PutStateByCompositeKey(APIstub, WALLET_TRANSACTIONS_INDX, []string{processingName, walletID, dateString, timeString, transactionID}, nil)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot update wallet transactions index: %s", err))
	}

	err = PutItemByCompositeKey(APIstub, TRANSACTIONS_INDX, []string{transactionID}, transaction)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot put transaction info: %s", err))
	}

	return shim.Success(nil)
}

func (cts *CrossTransactionSystem) addWallet(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Expected 1 parameter")
	}

	walletAsString := args[0]
	var walletInfo WalletInfo
	err := json.Unmarshal([]byte(walletAsString), &walletInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal wallet: %s", err))
	}
	processingName := walletInfo.ProcessingName
	walletID := walletInfo.ID

	isExists, err := cts.isProcessingExists0(APIstub, processingName)
	if err != nil {
		return shim.Error(err.Error())
	}
	if !isExists {
		return shim.Error("Processing does not exist")
	}
	isExists, err = cts.isWalletExists0(APIstub, processingName, walletID)
	if err != nil {
		return shim.Error(err.Error())
	}
	if isExists {
		return shim.Error("Wallet already exists")
	}

	err = PutItemByCompositeKey(APIstub, WALLETS_INDX, []string{processingName, walletID}, walletInfo)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot put wallet: %s", err))
	}

	return shim.Success(nil)
}

func main() {
	err := shim.Start(&CrossTransactionSystem{})
	if err != nil {
		fmt.Printf("Error starting CrossTransactionSystem chaincode: %s", err)
	}
}
