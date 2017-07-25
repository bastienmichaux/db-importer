const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');

const prompt = require('../prompt');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();
const inq = cst.inquiries;

describe('askCredentials', function () {
    afterEach(function () {
        // I restore original functions after each test
        // I must do so mocks from previous tests don't interfere with following tests
        sandbox.restore();
    });

    it('provides the correct default port for the chosen dbms', function () {
        // This replaces the function inquirer.prompt with a stub. I do so it doesn't need to prompt a user.
        const inquirerPromptStub = sandbox.stub(inquirer, 'prompt').onFirstCall().resolves({ dbms: 'mysql' });
        inquirerPromptStub.onSecondCall().resolves(null); // I don't care what it returns

        const expectedPortInq = Object.assign({ default: 3306 }, inq.port);

        return prompt.askCredentials()
            .then((onFulfilled) => {
                assert.deepEqual(inquirerPromptStub.getCall(1).args[0], [inq.host, expectedPortInq, inq.user, inq.password]);
            });
    });

    it('returns a fulfilled promise containing complete credentials', function () {
        const inquirerPromptStub = sandbox.stub(inquirer, 'prompt').onFirstCall().resolves({ dbms: 'mysql' });
        inquirerPromptStub.onSecondCall().resolves({
            host: '192.168.32.2',
            port: '10485',
            user: 'adminIsKing',
            password: 'VeryStrongAndSecretPassword'
        });

        return prompt.askCredentials()
            .then((onFulfilled) => {
                assert.deepEqual(
                    onFulfilled,
                    {
                        dbms: 'mysql',
                        host: '192.168.32.2',
                        port: '10485',
                        user: 'adminIsKing',
                        password: 'VeryStrongAndSecretPassword'
                    });
            });
    });
});
