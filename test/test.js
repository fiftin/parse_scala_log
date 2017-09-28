const parse = require('../parse_scala_log.js');
const expect = require('chai').expect;


describe('parse_scala_log', () => {
  it('parse simple log', () => {
    const obj = parse('Car(brand=BMW)');
    expect(obj.brand).to.eq('BMW');
  });
  it('parse log with same fields', () => {
    const obj = parse('Car(brand=BMW, year=4)');
    expect(obj.brand).to.eq('BMW');
    expect(obj.year).to.eq('4');
  });
  it('parse log with nestead object', () => {
    const obj = parse('Car(brand=BMW, year=4, owner=User(name=Denis))');
    expect(obj.brand).to.eq('BMW');
    expect(obj.year).to.eq('4');
    expect(obj.owner).to.eql({ clz: 'User', name: 'Denis' });
  });
  it('parse log with array', () => {
    const obj = parse('Car(brand=BMW, year=4, components={Engine(power=2389, volume=3829))');
    expect(obj.brand).to.eq('BMW');
    expect(obj.year).to.eq('4');
    expect(obj.components.length).to.eq(1);
    expect(obj.components[0]).to.eql({
      clz: 'Engine',
      power: '2389',
      volume: '3829'
    });
  });
  it('parse real data', () => {
    const obj = parse('OutboundStatisticsPacket(usersCount=1, statistic=Broadcast(sessions={Session(sessionId=6s408yivxv, streams={}), Session(sessionId=ahdtpyuzrx, streams={}), Session(sessionId=0koa17s1hk, streams={}), Session(sessionId=ku10q0ct9t, streams={}), Session(sessionId=ehvux85ups, streams={Stream(streamId=fb897ebe-7b35-4122-9b96-07a4c25e71f1, layers={Layer(mediaLayer=Video 100kbps, targetsCount=1)})})}, network=Some(Network(outputKbps=169, averageUser=AverageUser(outputKbps=169, skipKbps=0)))))');
    expect(obj.usersCount).to.eq('1');
    expect(obj.statistic.network.Network.outputKbps).to.eq('169');
  });
});
