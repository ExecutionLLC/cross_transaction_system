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

var indexCharsMap = map[rune]rune{
	'0': '9',
	'1': '8',
	'2': '7',
	'3': '6',
	'4': '5',
	'5': '4',
	'6': '3',
	'7': '2',
	'8': '1',
	'9': '0',
}

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

func Float32bytes(float float32) []byte {
	bits := math.Float32bits(float)
	bytes := make([]byte, 4)
	binary.LittleEndian.PutUint32(bytes, bits)
	return bytes
}

func TimestampStringToDateTime(timestampString string) (time.Time, error) {
	var result time.Time

	timestampInt64, err := strconv.ParseInt(timestampString, 10, 64)
	if err != nil {
		return result, errors.New(fmt.Sprintf("Cannot parse timestamp string: %s", err))
	}

	result = time.Unix(timestampInt64/1000, 0)
	return result, nil
}

func TimestampStringToDate(timestampString string) (time.Time, error) {
	dateTime, err := TimestampStringToDateTime(timestampString)
	if err != nil {
		return dateTime, err
	}
	result := time.Date(dateTime.Year(), dateTime.Month(), dateTime.Day(), 0, 0, 0, 0, time.UTC)
	return result, nil
}

func stringToIndexString(value string) string {
	result := make([]rune, 0, len(value))
	for _, c := range value {
		indexC, hasC := indexCharsMap[c]
		if hasC {
			result = append(result, indexC)
		} else {
			result = append(result, c)
		}
	}

	return string(result)
}

func DateTimeToIndexStrings(dateTime time.Time) (string, string) {
	part0, part1 := dateTime .Format("2006-01-02"), dateTime .Format("15:04:05")
	return stringToIndexString(part0), stringToIndexString(part1)

}

func TimestampToIndexStrings(timestamp int64) (string, string) {
	timestampSec := timestamp / 1000
	unixTime := time.Unix(timestampSec, 0)
	return DateTimeToIndexStrings(unixTime)
}

