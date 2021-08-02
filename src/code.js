// comms 
const { ipcRenderer } = require('electron')

const code = document.getElementById("codeblock");
var calls;



var editor = CodeMirror.fromTextArea(code, {
    lineNumbers: true,
    // readOnly:true,
    mode: 'text/x-fortran',
    matchBrackets: true,
    theme:'ayu-mirage',
    lineWrapping: true,         
    extraKeys: {
    "Ctrl-S": savefile,
    "Cmd-S": savefile,
  }      
    
});

editor.setSize(window.innerWidth-15, window.innerHeight-1)

window.onresize=()=>{editor.setSize(window.innerWidth-15, window.innerHeight-1)}

editor.setValue(    `
PROGRAM readme.f90
!This is where the function code appears
!***************************************
! Instructions are given below
!***************************************

    DO (click_on_node)
        CALL read_code_here(node)
        
        IF mouseover calls (red links) THEN
        
            call location is showed HERE in purple.
            
            The subroutine names are found using the regular 
            expression format of /\\b<name>\\b/i
            
        END IF 
        
        SELECT CASE (codewindow)
            ! custom parsing using keyboard commands
            CASE ('ctrl+F')
                This opens a regex search window for your code.
                
            CASE ('ctrl+G')
                Find Next !when searching
                
            CASE ('ctrl+S') !click here first
                WRITE(* , edited_<originfile>.f90)
                the currently edited window to
                the directory the app resides.
                
            CASE ('ctrl+R')
                Refresh this window and return the instructions
                
            CASE DEFAULT !(shortcuts)
                Other shortcuts can be found at 
                'https://defkey.com/codemirror-shortcuts'
                
        END SELECT 
                  
    END DO
    
END PROGRAM
    `);
    
    
editor.refresh()


var name = 'codeInstructions.f90'




function hilighttext(keyword){
    
editor.doc.getAllMarks().forEach(marker => marker.clear());
keyword = new RegExp("\\b"+keyword+"\\b","i")
var cursor = editor.getSearchCursor(keyword , CodeMirror.Pos(editor.firstLine(), 0), {caseFold: true, multiline: true});   

var found = true;
while (cursor.findNext()) {

    if (found){
        editor.setSelection(cursor.from(), cursor.to());
        editor.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20); 
        found=false
    }
    
    console.log(keyword, 'found at line ', cursor.pos.from.line + 1);
      
    editor.markText(
      cursor.from(),
      cursor.to(),
      { className: 'highlight' }
  );


  }

 

}


function savefile(instance){
    alert('saving edited_'+name )
    const fs = require('fs');
    try { 
        fs.writeFileSync('../edited_'+name, editor.doc.getValue(), 'utf-8'); }
    catch(e) { alert('Failed to save the file !'); }
        
}

// document.onkeypress = function (event) {
//         // detect key pressed
//         var key = event.keyCode;
//         if (event.ctrlKey) {
// 
//             if (key === ('S').charCodeAt(0) - 64) savefile();
//         }
// }

ipcRenderer.on('updatecode', (event, arg) => {
  console.log('UPPDAATTEE',arg) // prints "pong"
  // 
  editor.setValue(arg.code)
  editor.refresh()
  
  // code.innerHTML = hljs.highlight('!'+arg.id+
  //  '\n'+ arg.code || '\n% CALL '+arg.id+'\n !CODE NOT DEFINED',
  //     { language: "f90" }
  // ).value;
  // 
  // calls = [...document.getElementById('codeblock').querySelectorAll('span.hljs-keyword')].filter(d=>d.innerHTML==='CALL')
  // 
  // calls = new Map(calls.map((d,i)=>{
  //      return [d.nextSibling.nodeValue.split('(')[0].replace(' ','').toUpperCase(),d]
  // }) )
  
})


ipcRenderer.on('highlight', (event, arg) => {
  console.log('highlight',arg);

  editor.execCommand("find")
  hilighttext(arg)
  
          
  
  // [...calls.values()].forEach(d=>{d.style.color='';d.style['background-color']=''})
  // var me = calls.get(arg)
  // me.scrollIntoView(true,{block: "center"});
  // me.style['background-color']='Orange';
  // me.style.color='#222';
  // 
})
