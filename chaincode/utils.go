import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func GetItemByKey(APIstub shim.ChaincodeStubInterface, key string, item interface{}) error {
	itemAsBytes, err := APIstub.GetState(key)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot get item state: %s", err))
	}

	err := json.Unmarshal(itemAsBytes, item)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot unmarshal item: %s", err))
	}

	return nil
}

func GetItemByCompositeKey(APIstub shim.ChaincodeStubInterface, objectType string, attributes []string, item interface{}) error {
	key, err := APIstub.CreateCompositeKey(objectType, attributes)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}

	return GetItemByKey(APIstub, key, item)
}

func PutItemByKey(APIstub shim.ChaincodeStubInterface, key string, item interface{}) {
	itemAsBytes, err := json.Marshal(item)
	if err != nil {
		return shim.Error(fmt.Sprintf("Cannot marshal item: %s", err))
	}

	err := APIstub.PutState(key, itemAsBytes)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot put item state: %s", err))
	}

	return nil
}

func PutItemByCompositeKey(APIstub shim.ChaincodeStubInterface, objectType string, attributes []string, item interface{}) error {
	key, err := APIstub.CreateCompositeKey(objectType, attributes)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}

	return PutItemByKey(APIstub, key, item)
}
