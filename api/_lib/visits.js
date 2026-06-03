function getVisitStore() {
  if (!globalThis.__mcqVisitStore) {
    globalThis.__mcqVisitStore = { count: 0 };
  }

  return globalThis.__mcqVisitStore;
}

function incrementVisitCount() {
  const store = getVisitStore();
  store.count += 1;
  return store.count;
}

module.exports = {
  incrementVisitCount
};
