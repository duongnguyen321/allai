const e=new showdown.Converter;let t=null,n=null;const o=document.getElementById("submit-button"),l=document.getElementById("regenerate-response-button"),s=document.getElementById("prompt-input"),a=document.getElementById("model-select"),r=document.getElementById("response-list");let c=!1,i=null;function d(e,t){const n=`id-${Date.now()}-${Math.random().toString(16)}`,o=`\n            <div class="response-container ${e?"my-question":"chatgpt-response"}">\n                <img class="avatar-image" src="assets/img/${e?"me":"chatgpt"}.png" alt="avatar"/>\n                <div class="prompt-content" id="${n}">${t}</div>\n            </div>\n        `;return r.insertAdjacentHTML("beforeend",o),r.scrollTop=r.scrollHeight,n}function m(e,t){e.innerHTML=t,e.style.color="rgb(200, 0, 0)"}function u(e,o){t=e,n=o,l.style.display="flex"}async function g(g,p){const y=g??s.textContent;if(c||!y)return;o.classList.add("loading"),s.textContent="",p||d(!0,`<div>${y}</div>`);const f=p??d(!1),v=document.getElementById(f);var h;(h=v).textContent="",i=setInterval((()=>{h.textContent+=".","...."===h.textContent&&(h.textContent="")}),300),c=!0;try{const o=a.value,s=await fetch("/get-prompt-result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:y,model:o})});if(!s.ok)return u(y,f),void m(v,`HTTP Error: ${await s.text()}`);const c=await s.text();v.innerHTML="image"===o?`<img src="${c}" class="ai-image" alt="generated image"/>`:e.makeHtml(c.trim()),t=null,n=null,l.style.display="none",setTimeout((()=>{r.scrollTop=r.scrollHeight,hljs.highlightAll()}),10)}catch(e){u(y,f),m(v,`Error: ${e.message}`)}finally{c=!1,o.classList.remove("loading"),clearInterval(i)}}s.addEventListener("keydown",(function(e){"Enter"===e.key&&(e.preventDefault(),e.ctrlKey||e.shiftKey?document.execCommand("insertHTML",!1,"<br/><br/>"):g())})),o.addEventListener("click",(()=>{g()})),l.addEventListener("click",(()=>{!async function(){try{await g(t,n),l.classList.add("loading")}finally{l.classList.remove("loading")}}()})),document.addEventListener("DOMContentLoaded",(function(){s.focus()})),window.onload=function(){console.groupCollapsed("%cHello From Client side!","color: #20e3b2"),console.log("%cI am Duong from %chttps://duong.vercel.app%c!","color: #20e3b2","color: #58a6ff","color: #10a37f"),console.groupEnd(),console.groupCollapsed("%cPlease be a responsible user!","color: #f55"),console.log("%cThank you!","color: #20e3b2"),console.groupEnd(),s.focus()};