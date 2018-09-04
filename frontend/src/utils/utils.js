function immutableReplaceArrayItem(array, index, newItem) {
  return [
    ...array.slice(0, index),
    newItem,
    ...array.slice(index + 1),
  ];
}

function findIndexById(array, id) {
  return array.findIndex(item => item._id === id);
}

function makeHashById(array) {
  return array.reduce(
    (hash, item) => ({ ...hash, [item._id]: item }),
    Object.create(null),
  );
}


export default {
  immutableReplaceArrayItem,
  findIndexById,
  makeHashById,
};
