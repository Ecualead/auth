import "mocha";
import chai from "chai";
const expect = chai.expect;

describe("Stub module unit test", () => {
  it("Stub test", (done) => {
    expect("hello").to.be.a("string").to.have.length(5);
    done();
  }).timeout(1000);
});
