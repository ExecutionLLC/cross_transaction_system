class Utils {
  static collectInstancesOf(obj, instanceClass) {
    return Object
      .keys(obj)
      .map(k => obj[k])
      .filter(p => p instanceof instanceClass);
  }

  static checkObjProperties(obj, requiredProps) {
    requiredProps.forEach((k) => {
      const p = obj[k];
      if (p === undefined) {
        throw new Error(`Required property (${k}) is empty`);
      }
    });
  }
}

module.exports = Utils;
