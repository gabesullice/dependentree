# DependenTree

DependenTree is a simple tree and uuid-based Promise utility.

## Usage:
```javascript
import DependenTree from "dependentree";

// Create a new tree.
const tree = new DependenTree({
  logger: {
    log: function (msg) { /* this can be any object or class with a `log` method. */ };
  }
});


// Configure a resolver, which given a UUID returns a list of UUIDs representing
// objects or actions that will later be mapped to Promises.
tree.setResolver(function (uuid) {
  // Your resolver should always return a list, if the UUID has dependencies
  // which must be settled before this UUID can have its work done, you should
  // return those UUIDs here.
  return [];
});

// Once you've set a resolver, you can build the tree from a top-most UUID.
tree.build(uuid);

// Once you've built the tree, you can apply a function to the tree. This
// function will be run against the dependency tree from the bottom, up. The
// function will NOT be called until all dependencies as defined by the resolver
// above have been settled.
const rollUp = tree.rollUp(function (uuid) {
  return Promise((resolve, reject) => {
    // Do some work using the given UUID, like sending an API request.
    if (successful) {
      // Our "work", worked!
      resolve(uuid);
    } else {
      // If your work failed, reject the promise.
      reject("A reason");
    }
  });
});

// The rollUp method returns a Promise. It will only be resolved when ALL items
// in the dependency tree have been settled. It will be rejected if a child
// fails to be settled in the same way that Promise.all() is rejected when any
// item is rejected.
rollUp.then(console.log("Roll up worked!")).catch("Roll up failed :( ..."));
```
