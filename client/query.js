import Web3 from 'web3';
import DailyMask from '../build/contracts/DailyMask.json';
import {initWeb3} from './init.js';

let web3;
let dailyMask;

const initContract = () => {
	const deploymentKey = Object.keys(
		DailyMask.networks)[0];
	return  new web3.eth.Contract(
		DailyMask.abi,
		DailyMask.networks[deploymentKey].address
		);
};

const initQuery = async() =>{
	const $list = document.getElementById('list');
	console.log(dailyMask);
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

	await dailyMask.methods
		.memberCount()
		.call()
		.then( async(length) =>{
			console.log(length);
			for (var i = 0 ; i < length; i++){
				// iterate through array of members and display in list
				const member = await dailyMask.methods.members(i).call();
				console.log(member);

				const id =  member.id;
				const name =  member.name;
				const address = member.memberAddress;
				var eligible = member.eligible;

				let newContainer = document.createElement('div');
				var attContainer = document.createAttribute('id');
				attContainer.value = '-container' + i;
				newContainer.setAttributeNode(attContainer);

				let itemId = document.createElement('li');
				itemId.textContent = id ;

				let itemName = document.createElement('li');
				itemName.textContent = name ;

				let itemAddress = document.createElement('li');
				itemAddress.textContent = address ;

				let itemEligible = document.createElement('li');
				itemEligible.textContent = eligible ;

				let newButton = document.createElement('button');
				var attId = document.createAttribute('id');
				attId.value = 'button' + i;
				var att = document.createAttribute('type');
				att.value = 'submit'
				newButton.setAttributeNode(att);
				newButton.setAttributeNode(attId);
				newButton.innerHTML = 'Change';

				let p = document.createElement('p');

				newButton.addEventListener('click', async() =>{
					var hasChanged = (newButton.innerHTML == 'Save');

					const id = '-container' + newButton.getAttribute('id').slice(6);
					const parentContainer = document.getElementById(id);

					if(!hasChanged){

						var nameItem = parentContainer.children[1];
						var eligibleItem = parentContainer.children[3];

						window.currentName = nameItem.textContent;
						window.currentEligibility = eligibleItem.textContent;

						let nameForm = document.createElement('input');
						nameForm.value = itemName.textContent;

						let checkBox = document.createElement('input');
						var attType = document.createAttribute('type');
						attType.value = 'checkbox';
						checkBox.setAttributeNode(attType);

						var attChecked = document.createAttribute('checked');
						console.log('currentState' + eligibleItem.textContent);
						if(eligibleItem.textContent == 'true')
							checkBox.checked = true;
						else
							checkBox.checked = false;


						parentContainer.replaceChild(nameForm, nameItem);
						parentContainer.replaceChild(checkBox, eligibleItem);

						newButton.innerHTML = 'Save';
					}
					else{
						const newName = parentContainer.children[1].value;
						const newEligibility = parentContainer.children[3].checked;

						let nameList = document.createElement('li');
						let eligibleList = document.createElement('li');

						dailyMask.methods
							.changeMember(newName, newEligibility, parseInt(id.slice(10), 10))
							.send({from: accounts[0]})
							.then( () =>{
								nameList.textContent = newName;
								eligibleList.textContent = newEligibility;
								parentContainer.replaceChild(nameList, parentContainer.children[1]);
								parentContainer.replaceChild(eligibleList, parentContainer.children[3]);
							})
							.catch(e => {
								nameList.textContent = window.currentName;
								eligibleList.textContent = window.currentEligibility;
								parentContainer.replaceChild(nameList, parentContainer.children[1]);
								parentContainer.replaceChild(eligibleList, parentContainer.children[3]);
								let result = parentContainer.children[5];
								p.innerHTML = 'Change Failed (Moderator Only)';
							});

						
						newButton.innerHTML = 'Change';
					}

				});

				newContainer.appendChild(itemId);
				newContainer.appendChild(itemName);
				newContainer.appendChild(itemAddress);
				newContainer.appendChild(itemEligible);
				newContainer.appendChild(newButton);
				newContainer.appendChild(p);
				$list.appendChild(newContainer);
			}
		});
};

document.addEventListener('DOMContentLoaded',  () =>{

	initWeb3()
		.then( _web3 => {
			web3 = _web3;
			console.log(web3);
			dailyMask = initContract();
			initQuery();
		})
		.catch(e => {
			console.log(e.message);
		});		
	
});