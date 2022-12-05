

    function sendLog(label, data){
        const msg = {
            name: 'sendLog',
            label: label, 
            data: data
        }
        chrome.runtime.sendMessage(undefined, msg, undefined, function(response){
            
        });

    }

    function sleep(ms){
        return new Promise(function(resolve, reject){
            setTimeout(resolve, ms);
        });
    }

    function getDownloads(){
        const promise = new Promise(async function(resolve, reject){
            let msg = {
                name: 'getDownloads'
            }
            await chrome.runtime.sendMessage(undefined, msg, undefined );

            await sleep(250);

            msg.name = 'retrieveDownloads';

            let items = await chrome.runtime.sendMessage(undefined, msg, undefined );
            resolve(items);
        });
        return promise;
        
    }
    
    const KB = 1024;
    const MB = 1024*KB;
    const GB = 1024*MB;

    function readSize(filesize){
        if ( filesize < KB ){
            return `${filesize} B`;
        }

        if ( filesize < MB ){
            let size = Math.ceil(filesize/KB);
            return `${size} KB`;
        }

        if ( filesize < GB ){
            let size = Math.ceil(filesize/MB);
            return `${size} MB`;
        }

        let size = Math.ceil((filesize*10)/GB)/10;
        return `${size} GB`;
    }

    function momentAgo(str){
        
        //sendLog("momentAgo", str);

        const SECOND = 1000;
        const MINUTE = 60*SECOND;
        const HOUR = 60*MINUTE;

        let d1;
        if ( str == null )
            d1 = (new Date()).getTime();
        else   
            d1 = (Date.parse(str)); 

        let d2 = (new Date()).getTime(); 

        let diff = d2 - d1;
        
        if ( diff < SECOND ) return 'Just now';

        if ( diff < ( 10*SECOND ) ) return 'A few seconds ago';

        if ( diff < MINUTE ) return 'A minute ago';

        if ( diff < HOUR ) return `${Math.ceil(diff/MINUTE)} minutes ago`;

        return `${Math.ceil(diff*10/HOUR)/10} hours ago`;

    }

    function createRow(item){

        let li = document.createElement('li');
        let filesize = readSize(item.fileSize);
        
        sendLog("FILENAME",item.filename.split(/[/\\]/).pop());
        let url = new URL(item.finalUrl);
        let filename = decodeURIComponent(url.pathname.split('/').pop());
        filename = item.filename.split(/[/\\]/).pop();

        sendLog("Download Item", filename);
        let div1 = document.createElement('div');
        let a = document.createElement('a');
        a.href="#";
        a.setAttribute("did", item.id);
        a.innerHTML = `${filename} - ${filesize}`;
        a.onclick = function(){
            chrome.downloads.open(item.id);
        };
        div1.append(a);

        let endTime = null;
        if ( item.endTime ){
            if ( item.endTime.current ) endTime = item.endTime.current;
            else endTime = item.endTime;
            
        }
        let momentAgoStr = momentAgo(endTime);
        let div2 = document.createElement('div');

        let stateStr = '';
        if ( item.state ){
            if ( item.state.current ) stateStr = item.state.current;
            else stateStr = item.state;
        }

        div2.innerHTML = `${stateStr} - ${momentAgoStr}`;

        li.append(div1);
        li.append(div2);

        return li;
    }

    async function main(){
        sendLog("MAIN");
        let response = await getDownloads();
        sendLog("RESPONSE MAIN", response);
        //let keys = Object.keys(response);
        
        let ul = document.querySelector("ul.downloads");
//        sendLog("POPUP MAIN", JSON.stringify(keys) );
        ul.innerHTML = '';
        for ( let item of response ){
            
            
            try{
                let li = createRow(item);
                ul.append(li);
            }catch(e){

                sendLog("Exception", e);
                continue; 
            }
            
        }
  //      sendLog("Finish POPUP BUILT",null);
    }
    main();