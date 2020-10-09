const DailyMask = artifacts.require('DailyMask');
const truffleAssert = require('truffle-assertions');

contract('DailyMask', accounts => {
	let dailyMask = null;
	var moderator = accounts[0];
	var member =  accounts[1];
	const name = 'Joe'
	before(async() =>{
		dailyMask = await DailyMask.deployed();
	});

	it('Shouldn"t allow non-members to register', async() => {
		await truffleAssert.reverts(dailyMask.register(name, member, {from: member}), "VM Exception while processing transaction: revert");
	});

	it('Should allow moderator to register new members', async() => {
		await dailyMask.register(name, member, {from: moderator});
		var memberCount = await dailyMask.memberCount();
		assert.equal(memberCount.toNumber(), 1);
	});

	it('Should revert when exisitng members are registered again', async() => {
		await truffleAssert.reverts(dailyMask.register(name, member, {from: moderator}), "VM Exception while processing transaction: revert");
	});

	it('Should revert when non-moderator tries to reset eligibility', async() => {
		await truffleAssert.reverts(dailyMask.resetEligibility({from: member}));
	});

	it('Should reset eligibility of all members when moderator resets', async() => {
		await dailyMask.resetEligibility({from: moderator});
		var Member = await dailyMask.members(0);
		var eligibility = Member.eligible;
		assert.equal(eligibility, true);
	});

	it('Should receive mask when eligibility of member is true', async() => {
		let tx = await dailyMask.getMask({from: member});
		truffleAssert.eventEmitted(tx, 'gotMask');
	});

	it('Should revert when member has used up his quota', async() =>{
		await truffleAssert.reverts(dailyMask.getMask({from: member}), "VM Exception while processing transaction: revert");
	});

	it('Should revert when data of members get changed by non-moderator', async() =>{
		await truffleAssert.reverts(dailyMask.changeMember('randomName', true, 0, {from: member}), "VM Exception while processing transaction: revert");
	});

	it('Should change name of member by moderator', async() => {
		await dailyMask.changeMember('Jack', false, 0, {from: moderator});
		const changedMember = await dailyMask.members(0);
		var newName = changedMember.name;
		assert(changedMember.name == 'Jack');
	});

	it('Should change eligibility of member by moderator', async() => {
		await dailyMask.changeMember('Jack', true, 0, {from: moderator});
		var changedMember = await dailyMask.members(0);
		var eligibility = changedMember.eligible;
		assert.equal(eligibility, true);
	});
	
});