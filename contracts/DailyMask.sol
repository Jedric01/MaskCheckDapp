pragma solidity ^0.5.1;

contract DailyMask{
    struct Member{
        uint id;
        string name;
        address memberAddress;
        bool eligible;
    }
    
    address public moderator;
    Member[] public members; 
    uint public memberCount = 0;
    
    modifier onlyModerator{
        require(msg.sender == moderator);
        _;
    }
    
    event gotMask();
    event successfulRegistration();
    
    constructor() public{
        moderator = msg.sender;
    }
    
    function register(string memory name, address newAddress) public onlyModerator {
        (bool registered, uint id) = isRegistered(newAddress);
        if (registered) {
            revert();
        }
        members.push(Member(memberCount++, name, newAddress, false));
        emit successfulRegistration();
    }
    
    // moderator resets members' eligiblity each day 
    function resetEligibility() public onlyModerator{
        for(uint i = 0; i < members.length; i++){
            members[i].eligible = true;
        }
    }
    
    function getMask() public {
        (bool registered, uint id) = isRegistered(msg.sender);
        if(!registered){ 
            revert();
        }
        if(members[id].eligible == false) revert();        
        
        members[id].eligible = false;
        emit gotMask();
    }
    
    function changeMember(string memory name, bool eligible, uint changeIndex) public onlyModerator{
        members[changeIndex].name = name;
        members[changeIndex].eligible = eligible;
    }
    
    function isRegistered(address newAddress) private view returns(bool, uint){
        for (uint i = 0; i < members.length; i++){
            if(members[i].memberAddress == newAddress)
                return (true, i);
        }
        
        return (false, members.length);
    }
}