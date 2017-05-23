import test from "ava";
import DependenTree from "../dist/index.js";

test('A new tree can be instatiated', t => {
  t.notThrows(() => new DependenTree());
});

test('Can speficy a custom logger', t => {
  let logged = false;
  const tree = new DependenTree({
    logger: { log: function () {
      logged = true;
    }}
  });
  tree.logger.log();
  t.true(logged);
});

test('Can speficy a resolver', t => {
  let resolved = false;
  const tree = new DependenTree({
    resolver: function () {
      resolved = true;
    },
  });
  tree.resolver(true);
  t.true(resolved);
});

test('A default resolver is created if one is not speficified', t => {
  const uuid = '1234';
  const expected = `Attempted to resolve ${uuid}, but no resolver has been configured.`;
  let actual;
  const logger = (msg) => {
    actual = msg;
  }
  const tree = new DependenTree({logger: {log: logger}});
  tree.resolver(uuid);
    t.is(actual, expected, 'The default message was not as expected');
});

test('Can build a tree from a UUID', t => {
  const uuid = '1234';
  const tree = new DependenTree({logger: logger()});
  tree.build(uuid);
  t.is(uuid, tree.head.uuid, 'The inserted UUID was not added.');
})

test('Can recursively construct a tree', t => {
  const uuid = '1234';
  const children = ['5678'];
  const tree = new DependenTree({
    resolver: (arg) => {
      return (arg == uuid) ? children : [];
    },
  });
  tree.build(uuid);
  t.is(tree.head.children[0].uuid, children[0], 'A tree was not constructed.');
})

test('Can apply a function to a tree from bottom to top', async t => {
  const uuid = '1234';
  const children = ['5678'];
  const tree = new DependenTree({
    resolver: (arg) => {
      return (arg == uuid) ? children : [];
    },
    logger: logger(),
  });
  tree.build(uuid);

  let done = [];

  const expect = ['5678', '1234'];

  await tree.rollUp(function (uuid) {
    done.push(uuid);
    return Promise.resolve();
  }).then(() => {
    t.deepEqual(done, expect, 'The tree was not rolled up in order');
  });
})

test('Fails when a dependency fails', async t => {
  const uuid = '1234';
  const children = ['5678'];
  const tree = new DependenTree({
    resolver: (arg) => {
      return (arg == uuid) ? children : [];
    },
    logger: logger(),
  });
  tree.build(uuid);

  let done = [];

  const expect = ['5678'];

  await tree.rollUp(function (uuid) {
    done.push(uuid);
    return Promise.reject('Expected Failure');
  }).catch((reason) => {
    t.is(reason, 'Expected Failure', 'The fail reason was not returned.');
    t.deepEqual(done, expect, 'The parent was attempted even though the child failed.');
  });
})

function logger() {
  return {log: () => {}};
}
