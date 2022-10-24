// Turndown for markdown conversion 

var turndownService = new TurndownService({headingStyle:"atx"})


turndownService.addRule('linebreak', {
  filter: ['p','P','br'],
  replacement: function (content) {
    return ' &nbsp;\\n ' + content
  }
}
)

var toolbarOptions = [
   [{ header: [2,3, false] }],
   ['bold'],
  // [{ 'header': 2 }, { 'header': 3 }],
   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
   ['link','image'],
   ['clean']
] ;


var quill = new Quill('#editor', {
        theme: 'bubble',
        modules: { 
          toolbar: toolbarOptions
          //toolbar: "#toolbar"
        }
});

// when edited then update markdown 

quill.on('text-change',function(delta,oldDelta,source){
 
// Just get the content from the Div - probably there is a method to get the content string from the delta ? 
  var editorContent = document.querySelector("#editor .ql-editor").innerHTML 
  console.log(editorContent)
  var pcount = document.querySelector("#editor .ql-editor").getElementsByTagName("p").length ;
 console.log(pcount);
 // console.log(nl2br(editorContent));
  var markdown = turndownService.turndown(editorContent)
  //console.log(markdown);
  //console.log(markdown)
 
  document.getElementById("markdown").innerHTML=markdown;
  updateMarkdownCharCount(markdown.length);
})

function updateMarkdownCharCount(count){
  document.getElementById("char-count").innerHTML=count;
  document.getElementById("char-leftcount").innerHTML= 5000 - count ;
  if(count >50){setLengthError();}else{removeLengthError()}; 
}

function setLengthError(){
  document.getElementById("editorform").setAttribute("class", "nhsuk-form-group nhsuk-form-group--error");
  document.getElementById("lengthErrorSummary").style.display ="block";
  document.getElementById("lengthError").style.display ="block";
}

function removeLengthError(){
  document.getElementById("editorform").setAttribute("class", "nhsuk-form-group");
  document.getElementById("lengthErrorSummary").style.display ="none";
  document.getElementById("lengthError").style.display ="none";
}

// incase we need to handle & convert  
function nl2br (str, replaceMode, isXhtml) {

  var breakTag = (isXhtml) ? '<br />' : '<br>';
  var replaceStr = (replaceMode) ? '$1'+ breakTag : '$1'+ breakTag +'$2';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
}