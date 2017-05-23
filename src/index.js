/**
 * Represents a tree of dependent objects.
 * @class
 */
class DependenTree {

  /**
   * Creates a new instance of a DependenTree.
   * @param {Object} [options] - A configuration object.
   * @param {Object} options.logger - Any object which implements a `log` function.
   * @param {function(string): Array<string>} options.resolver - A function which, given a uuid, will return an array of dependent IDs.
   */
  constructor(options = {}) {
    this.setLogger(options.logger);
    this.setResolver(options.resolver);
  }

  /**
   * Starts the resolution of a dependency tree for a single uuid.
   * @param {string} uuid - The topmost uuid for this particular tree.
   * @public
   */
  build(uuid) {
    this.head = this.newNode(uuid);
  }

  /**
   * Performs the given operation on the tree from the bottom to the the top.
   *
   * The given function should return a Promise. A node in the tree will not
   * have the operation performed until all of it's dependencies have
   * successfully had the same operation performed. That is, the Promise
   * returned for all of its children have been resolved.
   *
   * @param {function(string): Promise} applicator - A function which given a UUID returns a Promise that should be resolved before moving up the dependency tree.
   * @public
   */
  rollUp(applicator) {
    const promisify = (node) => {
      return new Promise((resolve, reject) => {
        Promise.all(node.children.map(promisify))
          .then((success) => {
            this.attend(node, applicator)
              .then((nodeSuccess) => {
                resolve(nodeSuccess);
              })
              .catch((nodeReason) => {
                reject(nodeReason);
              });
          })
          .catch((reason) => {
            reject(reason);
          });
      });
    };

    return promisify(this.head);
  }

  /**
   * Set the dependency resolver to be used to recursively build the tree.
   * @param {function(string): Array<string>} resolver - A function which, given a uuid, will return an array of dependent IDs.
   * @public
   */
  setResolver(resolver = false) {
    const fallback = (uuid) => {
      this.log(`Attempted to resolve ${uuid}, but no resolver has been configured.`);
      return [];
    };
    this.resolver = resolver || fallback;
  }

  /**
   * Set the logger to be used.
   * @param {Object} options.logger - Any object which implements a `log` function.
   * @public
   */
  setLogger(logger = false) {
    this.logger = logger || console;
  }

  /**
   * Applies the applicator to a given node, wrapping logging around it.
   * @param {TreeNode} node - The node with which to apply the applicator.
   * @param {function(string): Promise} node - The function applicator which returns a Promise.
   * @protected
   */
  attend(node, applicator) {
    return new Promise((resolve, reject) => {
      applicator(node.uuid)
        .then((success) => {
          this.log(`Successfully rolled up ${node.uuid}.`);
          resolve(success);
        })
        .catch((reason) => {
          this.log(`Attempted to roll up ${node.uuid}. However, the process failed with error: "${reason}"`);
          reject(reason);
        });
    });
  }

  /**
   * Recursively creates TreeNodes.
   * @protected
   */
  newNode(uuid) {
    return new TreeNode(uuid, this.resolve(uuid).map(child => {
      return this.newNode(child);
    }));
  }

  /**
   * Uses the configured resolver to resolve dependencies given some uuid.
   * @protected
   */
  resolve(uuid) {
    if (!this.resolver) {
      this.setResolver();
    }
    return this.resolver(uuid);
  }

  /**
   * Logs a message.
   * @protected
   */
  log() {
    if (!this.logger) {
      this.setLogger();
    }
    this.logger.log(...arguments);
  }

}

/**
 * Represents a particular item which can live anywhere in a dependency tree.
 * @class
 */
class TreeNode {

  /**
   * Creates a new instance of a TreeNode.
   * @param {string} uuid - The uuid of this particular node.
   * @param {TreeNode[]} [children=[]] - An array of dependent TreeNodes.
   */
  constructor(uuid, children = []) {
    this.uuid = uuid;
    this.children = children;
  }

}

export default DependenTree;
