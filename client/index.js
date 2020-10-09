import Web3 from 'web3';
import DailyMask from '../build/contracts/DailyMask.json';
import {initWeb3} from './init.js';

export let web3;
export let dailyMask;

/*
const initWeb3 =  () =>  {
	return new Promise((resolve, reject) => {
		//Case 1: New Metamask is present
		if(typeof window.ethereum !== undefined){
			window.ethereum.enable()
			.then( () => {
				resolve(
					new Web3(window.ethereum)
			 	);
			})
			.catch(e => {
				reject(e);
			});
			return;
		};
		//Case 2: Old Metamask is present
		if(typeof window.web3 !== undefined){
			return resolve(
				new Web3(window.web3.currentProvider)
			);
		};
		
		//Case 3: no metamask present, just connect to ganache
		resolve(new Web3('http://localhost:9545'));
	});
}
*/

const initContract = () => {
	const deploymentKey = Object.keys(
		DailyMask.networks)[0];
	return  new web3.eth.Contract(
		DailyMask.abi,
		DailyMask.networks[deploymentKey].address
		);
}



const initApp = () =>{
	const $addMemberData = document.getElementById('addMemberData');
	const $feedbackRegistration = document.getElementById('feedbackRegistration');
	const $getMaskButton = document.getElementById('getMaskButton');
	const $textResult = document.getElementById('textResult');
	const $resetButton = document.getElementById('resetButton');
	const $feedbackReset = document.getElementById('feedbackReset');
	let accounts = [];

	web3.eth.getAccounts()
		.then( _accounts =>{
			accounts = _accounts;
			console.log(accounts[0]);
		});

	window.ethereum.on('accountsChanged', _accounts => {
		accounts = _accounts;
		console.log(accounts);
	});

	dailyMask.events.gotMask()
	.on('data', event =>{
		console.log(event);
		$textResult.innerHTML = "Here's your daily mask!"
	});

	dailyMask.events.successfulRegistration()
	.on('data', event =>{
		console.log(event);
		$feedbackRegistration.innerHTML = "Successful Registration.";
	});

	$addMemberData.addEventListener('submit', e =>{
		e.preventDefault();

		const name = e.target.elements[0].value;
		const address = e.target.elements[1].value;

		console.log(name +': ' + address);

		dailyMask.methods
			.register(name, address)
			.send({from: accounts[0]})
			.then( () =>{
				console.log(accounts[0] + " has been successfully registered");
			})
			.catch(err =>{
				console.log(err);
				$feedbackRegistration.innerHTML = "Unsuccessful Registration";
			});
	});

	$getMaskButton.addEventListener('click', () =>{
		dailyMask.methods
			.getMask()
			.send({from: accounts[0]})
			.then( () =>{
				console.log(accounts[0] + " has received a mask");
			})
			.catch( err =>{
				console.log(err);
				$textResult.innerHTML = "Sorry, you've used up your daily quota. Come back tomorrow!";
			});
	});

	$resetButton.addEventListener('click', () =>{
		dailyMask.methods
			.resetEligibility()
			.send({from: accounts[0]})
			.then( () =>{
				console.log("All members are now eligible for mask collection");
				$feedbackReset.innerHTML = "All members are now eligible for mask collection";
			})
			.catch( err =>{
				console.log(err);
				$feedbackReset.innerHTML = "Reset Failed(check if accounts is moderator's)";
			});
	});
};

document.addEventListener('DOMContentLoaded', () => {
	initWeb3()
		.then(_web3 => {
			web3 = _web3;
			dailyMask = initContract();
			initApp();
		})
		.catch(err => console.log(err.message));
})