// Turndown for markdown conversion 

var turndownService = new TurndownService({headingStyle:"atx"})


turndownService.addRule('linebreak', {
  filter: ['p','P','br','BR'],
  replacement: function (content) {
    return ' &nbsp;\\n ' + content
  }
}
)

// handle list items ! 
turndownService.addRule('listitem-bullet', {
  filter: 'li',
  replacement: function (content, node, options) {
          content = content
          .replace(/^\n+/, '') // remove leading newlines
          .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
          .replace(/\n/gm, '\n    '); // indent
        var prefix = options.bulletListMarker + ' ';
        var parent = node.parentNode;
        if (parent.nodeName === 'OL') {
          var start = parent.getAttribute('start');
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + '. ';
        }
        return (
          "\\n " + prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
        );
    }
  }
) 

var toolbarOptions = [
   [{ header: [2,3, false] }],
   ['bold'],
  // [{ 'header': 2 }, { 'header': 3 }],
   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
   //[{ 'list': 'bullet' }],
   ['link','image'],
   ['clean']
] ;


var quill = new Quill('#editor', {
        theme: 'bubble',
        modules: { 
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: imageHandler
            }
          }
          //toolbar: "#toolbar"
        }
});

/*
function imageHandler() {
  var range = this.quill.getSelection();
  var value = prompt('please copy paste the image url here.');
  if(value){
      this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER).format('alt','test');
  }
}
*/
function imageHandler() {
  const tooltip = this.quill.theme.tooltip;
  const originalSave = tooltip.save;
  const originalHide = tooltip.hide;

  tooltip.save = function () {
    const range = this.quill.getSelection(true);
    const value = this.textbox.value;
    if (value) {
      this.quill.insertEmbed(range.index, 'image', value, 'user');
    }
  };
  // Called on hide and save.
  tooltip.hide = function () {
    tooltip.save = originalSave;
    tooltip.hide = originalHide;
    tooltip.hide();
  };
  tooltip.edit('image');
  tooltip.textbox.placeholder = 'Embed URL';
}

const Image = Quill.import('formats/image');

class ImageBlot extends Image {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', this.sanitize(value));
      node.setAttribute('alt', this.sanitize(value).split('/').reverse()[0].split('.')[0]);
    }
    return node;
  }
}

Quill.register(ImageBlot);


// when edited then update markdown 

quill.on('text-change',function(delta,oldDelta,source){
 
  // Just get the content from the Div - probably there is a method to get the content string from the delta ? 
  var editorContent = document.querySelector("#editor .ql-editor").innerHTML 
  //console.log(editorContent)
  var pcount = document.querySelector("#editor .ql-editor").getElementsByTagName("p").length ;
  //console.log(pcount);
  // console.log(nl2br(editorContent));
  var markdown = turndownService.turndown(editorContent)
  //console.log(markdown);
  
  var rtl = document.querySelector("#editor .ql-editor").getElementsByClassName("ql-direction-rtl").length;
  var ralign= document.querySelector("#editor .ql-editor").getElementsByClassName("ql-align-right").length;
  // if RTL then display warning message ! 
  if(rtl+ralign > 0){console.log("rtl detected");document.getElementById("RTLorLEFTWarning").style.display ="block";}else{document.getElementById("RTLorLEFTWarning").style.display ="none";}
  
 // var outputContent =   nl2br(markdown) ;

  document.getElementById("markdown").innerHTML=markdown;

  updateMarkdownCharCount(markdown.length);
})

function updateMarkdownCharCount(count){
  document.getElementById("char-count").innerHTML=count;
  document.getElementById("char-leftcount").innerHTML= 5000 - count ;
  if(count >5000){setLengthError();}else{removeLengthError()}; 
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

const checkbox = document.getElementById('nl2br')

checkbox.addEventListener('change', (event) => {
  var outcontent = document.getElementById("markdown").innerHTML;
  if (event.currentTarget.checked) {
    //alert('checked');
    
    document.getElementById("markdown").innerHTML = outcontent.replace(/\\n/g,'<br>');
  } else {
    //alert('not checked');
    document.getElementById("markdown").innerHTML = outcontent.replace(/<br>/g,'\\n');
  }
})