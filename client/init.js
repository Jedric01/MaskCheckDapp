import Web3 from 'web3';
import DailyMask from '../build/contracts/DailyMask.json'

export const initWeb3 =  () => {
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
};
