const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');

const prompt = require('../prompt');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();
const inq = cst.inquiries;

describe('askCredentials', function () {
    afterEach(function () {
        sandbox.restore();
    });

    it('provides the correct default for the chosen dbms', function () {
        const inquirerPromptStub = sandbox.stub(inquirer, 'prompt').onCall(0).resolves({ dbms: cst.dbmsList.mysql.name });
        inquirerPromptStub.onCall(1).resolves(null);

        const expectedPortInq = Object.assign({ default: 3306 }, inq.port);

        return prompt.askCredentials()
            .then((onFulfilled) => {
                assert.deepEqual(inquirerPromptStub.getCall(1).args[0], [inq.host, expectedPortInq, inq.user, inq.password]);
            });
    });

    it.skip('returns a fulfilled promise containing complete credentials', function () {
        const askStub = sandbox.stub(inquirer, 'prompt').withArgs(inq.dbms).resolves('mysql');

        console.log(prompt.askCredentials())
            .then((onFulfilled) => {
                console.log(askStub.callCount);
            });
    });
});
