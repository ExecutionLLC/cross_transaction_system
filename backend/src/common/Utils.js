class Utils {
  static collectInstancesOf(obj, instanceClass) {
    return Object
      .keys(obj)
      .map(k => obj[k])
      .filter(p => p instanceof instanceClass);
  }
}

module.exports = Utils;
