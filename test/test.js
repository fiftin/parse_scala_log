const parse = require('../parse_scala_log.js');
const expect = require('chai').expect;


describe('parse_scala_log', () => {
  it('parse simple log', () => {
    const obj = parse('Car(brand=BMW)');
    expect(obj.brand).to.eq('BMW');
  });



  it('parse real log 1', () => {
    const obj = parse(
      'notifications { relayStatistics { usersCount: 101 broadcast { sessions { sessionId: "8tk6a9iiye" } network { outputKbps: 0 averageUser { outputKbps: 0 skipKbps: 0 } } } } }',
      'new');
    expect(obj.notifications.relayStatistics.broadcast.network.outputKbps).to.eq('0');
  });

  it('parse real log 2', () => {
    const obj = parse(
      'notifications { relayStatistics { usersCount: 1458 broadcast { sessions { sessionId: "tnrumne4t2" streams { streamId: "a89afd1b-d4d9-42f8-8803-b29c40be6be6" layers { mediaLayer { mediaType: Video bitrate: 100000 framerate: 15 } targetsCount: 181 } layers { mediaLayer { mediaType: Video bitrate: 500000 framerate: 15 } targetsCount: 151 } layers { mediaLayer { mediaType: Video bitrate: 1000000 framerate: 15 } targetsCount: 323 } layers { mediaLayer { mediaType: Video bitrate: 300000 framerate: 15 } targetsCount: 123 } layers { mediaLayer { mediaType: Video bitrate: 1500000 framerate: 15 } targetsCount: 192 } layers { mediaLayer { mediaType: Video bitrate: 1200000 framerate: 15 } targetsCount: 238 } layers { mediaLayer { mediaType: Video bitrate: 700000 framerate: 15 } targetsCount: 226 } } } network { outputKbps: 728768 averageUser { outputKbps: 504 skipKbps: 0 } } } } }',
      'new');
    expect(obj.notifications.relayStatistics.usersCount).to.eq('1458');
    expect(obj.notifications.relayStatistics.broadcast.sessions.sessionId).to.eq('tnrumne4t2');
    expect(obj.notifications.relayStatistics.broadcast.sessions.streams.layers.length).to.eq(7);
  });

  it('parse real log record', () => {
    const obj = parse('InboundNotifications(notifications=Notifications(notifications={Notification(content=RelayStatistics(value=RelayStatistics(usersCount=50, broadcast=Broadcast(sessions={Session(sessionId=o5rpqlivyz, streams={Stream(streamId=BF1DB1B4-F710-4E83-9D5D-1D799E57AD38, layers={Layer(mediaLayer=Video 1000kbps, targetsCount=50)})})}, network=Some(Network(outputKbps=20719, averageUser=AverageUser(outputKbps=414, skipKbps=0)))))))}))');
    expect(obj.notifications.notifications[0].content.value).not.null;
  });

  it('parse simple log where value has space', () => {
    const obj = parse('Car(brand=BMW X5)');
    expect(obj.brand).to.eq('BMWX5');
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
