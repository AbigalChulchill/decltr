const { handler } = require("./build/serverfull");

const testEvent = {
  pair: "ADAUSD",
  profit: ".1",
  volume: "30",
};

handler(testEvent).then(console.log).catch(console.error);
