function spaceAdder (query){
  let value = query.topics
  value = value.replace(/([A-Z])/g, " $1").trim();
  query.topics = value
  return query;
};

module.exports = {spaceAdder}