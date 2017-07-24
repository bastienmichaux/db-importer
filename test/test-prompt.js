const prompt = require('../prompt');
const cst = require('../constants');

describe('askCredentials', function () {
    it('returns a fulfilled promise containing complete credentials', function () {
        const askStub = sinon.stub(inquirer, 'prompt').withArgs(cst.inquiries.dbms).resolves('mysql');

        console.log(prompt.askCredentials());
            // .then((onFulfilled) => {
            //     console.log(askStub.callCount);
            // });
    });
});
