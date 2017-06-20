/* global describe, beforeEach, it*/
/* eslint-disable no-unused-vars, prefer-arrow-callback */

const assert = require('assert');

describe('base.js', function () {
    describe('essentials', function () {
        it('are all there');
    });
    describe('validateMysqlCredentials', function () {
        it('returns true when credentials are ok');
        it('returns a new error when a property is missing');
    });
});
