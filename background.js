console.clear();
console.log(new Date());
chrome.downloads.setShelfEnabled(false);


let downloadsItems = {};

function iconON(){
    console.log("ICON ON");
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: [200,0,0,255] });
}

function iconOFF(){
    console.log("ICON OFF");
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: [200,0,0,0] });
}

function addItem(item){
    
    iconON();
    

    downloadsItems[item.id] = {  ...downloadsItems[item.id], ...item };
    let keys = Object.keys(downloadsItems).reverse();
    if ( keys.length > 10 ){
        console.log("Too much keys",keys);
        for ( let k of keys.slice(10) ){
            delete downloadsItems[k];
        }
        keys = Object.keys(downloadsItems);
        console.log(keys);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    
});

chrome.downloads.onCreated.addListener(function(item){
    addItem(item);
    console.log("CREATED ITEM", item);
});

chrome.downloads.onChanged.addListener(function(item){
    addItem(item);
    if ( item.state != undefined ){
        if ( item.state.current == 'complete' ){
            console.log("FINISHED ITEM", item);
                        
        }
    }
    if ( item.error ){
        delete downloadsItems[item.id] ;
    }
    console.log("CHANGED ITEM", item);
});



chrome.runtime.onMessage.addListener( async function(msg, sender, fn){
    if ( msg.name ==  'getDownloads' ){
        console.log("getDownloads", downloadsItems, sender);
        setTimeout( iconOFF, 20000);
        const opts = {
            limit: 10,
            orderBy: ['-startTime']
        };
        chrome.downloads.search(opts, function(items){
            downloadsItems = items;            
        });
        
        fn([]);
        return true;
    }


    if ( msg.name == 'retrieveDownloads' ){
        fn ( downloadsItems );
        return true;
    }

    if ( msg.name == 'sendLog'){
        console.log(msg.label, msg.data);
        fn ( );
        return true; 
    }
});