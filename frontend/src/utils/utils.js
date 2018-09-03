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


export default {
  immutableReplaceArrayItem,
  findIndexById,
};
