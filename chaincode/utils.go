package main

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func GetItemByKey(APIstub shim.ChaincodeStubInterface, key string, item interface{}) error {
	itemAsBytes, err := APIstub.GetState(key)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot get item state: %s", err))
	}
	if itemAsBytes == nil {
		return errors.New("Cannot find item")
	}

	err = json.Unmarshal(itemAsBytes, item)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot unmarshal item: %s", err))
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

func PutItemByKey(APIstub shim.ChaincodeStubInterface, key string, item interface{}) error {
	itemAsBytes, err := json.Marshal(item)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot marshal item: %s", err))
	}

	err = APIstub.PutState(key, itemAsBytes)
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

func PutStateByCompositeKey(APIstub shim.ChaincodeStubInterface, objectType string, attributes []string, value []byte) error {
	key, err := APIstub.CreateCompositeKey(objectType, attributes)
	if err != nil {
		return errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}

	return APIstub.PutState(key, value)
}

func CheckItemExistanceByKey(APIstub shim.ChaincodeStubInterface, key string) (bool, error) {
	value, err := APIstub.GetState(key)
	if err != nil {
		return false, errors.New(fmt.Sprintf("Cannot get state: %s", err))
	}

	return value != nil, nil
}

func CheckItemExistanceByCompositeKey(APIstub shim.ChaincodeStubInterface, objectType string, attributes []string) (bool, error) {
	key, err := APIstub.CreateCompositeKey(objectType, attributes)
	if err != nil {
		return false, errors.New(fmt.Sprintf("Cannot create composite key: %s", err))
	}
	return CheckItemExistanceByKey(APIstub, key)
}

func StringToBool(boolAsString string) bool {
	if boolAsString == "true" {
		return true
	}

	return false
}

func BoolToResponse(value bool) pb.Response {
	if value {
		return shim.Success([]byte("true"))
	}
	return shim.Success([]byte("false"))
}

func Float32frombytes(bytes []byte) float32 {
	bits := binary.LittleEndian.Uint32(bytes)
	float := math.Float32frombits(bits)
	return float
}

func Float32bytes(float float64) []byte {
	bits := math.Float64bits(float)
	bytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(bytes, bits)
	return bytes
}

func TimestampToDateAndTimeStrings(timestamp int64) (date string, time string) {
	timestampSec := timestamp / 1000
	unixTime := time.Unix(timestampSec, 0)
	return unixTime.Format("2006-01-02"), unixTime.Format("15:04:05")
}
