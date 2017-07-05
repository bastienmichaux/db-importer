# test/

This directory holds the tests run by Mocha.

Additionally, when running `npm test`, Istanbul will create a `coverage` folder. Check the `index.html` file created in this `coverage` folder for details about what isn't test-covered yet  in your branch.

If you have functions that are pointless to test, add `/* istanbul ignore next */` before it.

**Example:**

```js
/* istanbul ignore next */
const logStuff = () => {
  console.log('Hello, I\'m definitely a useless piece of code.');
};
```
