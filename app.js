const API_BASE="/.netlify/functions";
const levels=Object.keys(window.CURRICULUM||{});
const $=s=>document.querySelector(s);
const premiumStorageKey="tn_academy_parent_email";

document.addEventListener("DOMContentLoaded",()=>{
  $("#year").textContent=new Date().getFullYear(); loadWelcomeBanner();
  buildPhonics(); buildFilters(); renderLessons(); restoreLearnerHub();
  $("#level-filter").addEventListener("change",()=>{buildSubjects();renderLessons()});
  $("#subject-filter").addEventListener("change",renderLessons);
  $("#lesson-search").addEventListener("input",renderLessons);
  initPractice(); initAssessments(); initExam(); initAcademyMenu();
  $("#registration-form").addEventListener("submit",submitRegistration);
  $("#inquiry-form").addEventListener("submit",submitInquiry);
  $("#access-form").addEventListener("submit",checkAccess);
});
async function loadWelcomeBanner(){try{const r=await fetch(`${API_BASE}/site-settings`);const d=await r.json();if(!r.ok)return;const s=d.settings||{};if(s.welcome_eyebrow)$("#welcome-eyebrow").textContent=s.welcome_eyebrow;if(s.welcome_title)$("#welcome-title").textContent=s.welcome_title;if(s.welcome_text)$("#welcome-text").textContent=s.welcome_text;if(s.welcome_button)$("#hero-menu-open").textContent=s.welcome_button}catch(e){}}

function buildPhonics(){
 const words={A:["Apple","🍎"],B:["Ball","⚽"],C:["Cat","🐱"],D:["Dog","🐶"],E:["Egg","🥚"],F:["Fish","🐟"],G:["Goat","🐐"],H:["Hat","🎩"],I:["Igloo","🧊"],J:["Jam","🍓"],K:["Kite","🪁"],L:["Lion","🦁"],M:["Moon","🌙"],N:["Nest","🪺"],O:["Orange","🍊"],P:["Pen","🖊️"],Q:["Queen","👑"],R:["Rabbit","🐰"],S:["Sun","☀️"],T:["Tiger","🐯"],U:["Umbrella","☂️"],V:["Van","🚐"],W:["Watch","⌚"],X:["Xylophone","🎵"],Y:["Yam","🍠"],Z:["Zebra","🦓"]};
 $("#phonics-grid").innerHTML=Object.entries(words).map(([l,[w,icon]])=>`<button class="letter" onclick="speak('Letter ${l}. ${w}. ${phonicsLine(l,w)}')"><strong>${l}</strong><span class="phonics-visual">${icon}</span><small>${w}</small></button>`).join("");
}
function phonicsLine(l,w){const vowel="AEIOU".includes(l);return vowel?`The letter ${l} can make a vowel sound, as in ${w}.`: `The letter ${l} starts the word ${w}.`}
function buildFilters(){
 $("#level-filter").innerHTML=levels.map(x=>`<option>${x}</option>`).join("");
 buildSubjects();
 document.querySelectorAll('select[name="level"]').forEach(s=>s.innerHTML='<option value="">Select level</option>'+levels.map(x=>`<option>${x}</option>`).join(""));
}
function buildSubjects(){const level=$("#level-filter").value||levels[0];const subjects=Object.keys(window.CURRICULUM[level]||{});$("#subject-filter").innerHTML='<option value="">All subjects</option>'+subjects.map(x=>`<option>${x}</option>`).join("")}
function isPremiumLesson(title,subject,level,index){
  const premium=window.PREMIUM_LESSONS?.[level]?.[subject]||[];
  return premium.includes(title);
}
function renderLessons(){
 const saved=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};
 const level=saved.level||$("#level-filter").value||levels[0];
 if(saved.level) $("#level-filter").value=saved.level;
 const subject=$("#subject-filter").value,q=($("#lesson-search").value||"").toLowerCase();let rows=[];
 for(const [sub,lessons] of Object.entries(window.CURRICULUM[level]||{})) if(!subject||sub===subject) lessons.forEach((lesson,i)=>{if(!q||`${sub} ${lesson}`.toLowerCase().includes(q))rows.push({sub,lesson,i,premium:isPremiumLesson(lesson,sub,level,i)});});
 $("#course-scope-note").textContent=saved.level?`Showing only ${saved.child||"your learner"}'s registered class: ${level}.`:`Register or use Parent Class Access to unlock the learner's exact class.`;
 $("#curriculum-grid").innerHTML=rows.map(r=>`<article class="lesson-card ${r.premium?'locked':''}"><span class="tag">${r.sub}</span>${r.premium?'<span class="lock-badge">🔒 PREMIUM</span>':''}<h3>${r.lesson}</h3><p>${lessonSummary(r.lesson,r.sub,level)}</p><button class="btn small" onclick="openLesson('${esc(r.lesson)}','${esc(r.sub)}','${esc(level)}',${r.premium})">${r.premium?'🔒 View premium':'Open lesson'}</button></article>`).join("")||"<p>No lessons found for this registered class.</p>";
}
function lessonSummary(title,subject,level){const c=buildLesson(title,subject,level);return c.goal+" Learn the idea, see examples, practise and try a challenge."}
function openLesson(title,subject,level,premium=false){
 if(premium){
   const email=sessionStorage.getItem(premiumStorageKey)||"";
   if(!email){openModal(`<p class="eyebrow">🔒 PREMIUM LESSON</p><h2>${title}</h2><p>This lesson is part of Premium Learning. Enter the parent email used for registration or payment to check access.</p><form onsubmit="event.preventDefault();checkPremiumAccess('${esc(title)}','${esc(subject)}','${esc(level)}')" class="form-grid compact"><input id="premium-email" type="email" required placeholder="Parent email"><button class="btn primary">Check Premium Access</button><a class="btn ghost" href="#premium" onclick="closeModal()">Unlock Premium</a><p id="premium-status" class="form-status"></p></form>`);return;
   }
   checkPremiumAccess(title,subject,level);return;
 }
 showLesson(title,subject,level,false);
}
async function checkPremiumAccess(title,subject,level){
 const input=$("#premium-email"),status=$("#premium-status");const email=(input?input.value:sessionStorage.getItem(premiumStorageKey)||"").trim();if(!email)return;
 if(status)status.textContent="Checking access…";
 try{const r=await post("parent-access",{email,child_name:""}); if(r.ok&&r.active){sessionStorage.setItem(premiumStorageKey,email);showLesson(title,subject,level,true)} else if(r.ok&&r.message){if(status)status.textContent="Premium access is not active for this account yet.";else openModal(`<p class="eyebrow">PREMIUM</p><h2>${title}</h2><p>${r.message}</p><a class="btn primary" href="#premium" onclick="closeModal()">Choose a Premium plan</a>`)} }
 catch(e){if(status)status.textContent="We couldn't check that email. Please register the learner first or choose a Premium plan."}
}
function showLesson(title,subject,level,premium){const c=buildLesson(title,subject,level);openModal(`<p class="eyebrow">${subject} • ${level}${premium?' • PREMIUM':''}</p><h2>${title}</h2><div class="lesson-detail"><div><h3>🎯 Learning goal</h3><p>${c.goal}</p></div><div><h3>📖 Friendly explanation</h3><p>${c.explain}</p></div><div><h3>💡 Examples</h3><ul>${c.examples.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h3>✏️ Practise</h3><ol>${c.practice.map(x=>`<li>${x}</li>`).join("")}</ol></div><div><h3>⭐ Challenge</h3><p>${c.challenge}</p></div><button class="btn primary" onclick="speak('${esc(`${title}. ${c.goal} ${c.explain} Examples: ${c.examples.join('. ')} Practice: ${c.practice.join('. ')}`)}')">🔊 Read this lesson aloud</button></div>`)}
function esc(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g," ")}
function speak(text){if("speechSynthesis"in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.76;u.pitch=1.02;u.volume=.42;const voices=speechSynthesis.getVoices();const preferred=voices.find(v=>/Samantha|Karen|Moira|Ava|Zira|Google UK English Female|Google US English Female|female/i.test(v.name));if(preferred)u.voice=preferred;speechSynthesis.speak(u)}}

const practiceQ=[
 {q:"Which word starts with /b/?",a:["Ball","Cat","Sun","Fish"],c:0},{q:"What is 7 + 5?",a:["10","11","12","13"],c:2},{q:"Which is a living thing?",a:["Stone","Chair","Goat","Cup"],c:2},{q:"How many sides does a triangle have?",a:["2","3","4","5"],c:1},{q:"Which is a vowel?",a:["B","E","T","M"],c:1},{q:"What is 15 - 6?",a:["7","8","9","10"],c:2},{q:"Which planet is known as the Red Planet?",a:["Mars","Earth","Venus","Jupiter"],c:0},{q:"Which material is usually used for writing on paper?",a:["Pencil","Spoon","Shoe","Plate"],c:0},{q:"What comes after 19?",a:["18","20","21","29"],c:1},{q:"Which shape has four equal sides?",a:["Circle","Triangle","Square","Oval"],c:2}
];
let pi=0,ps=0,answered=false;
function initPractice(){renderQuestion();$("#next-question").onclick=()=>{if(!answered)return;pi=(pi+1)%practiceQ.length;answered=false;$("#next-question").disabled=true;$("#practice-result").textContent="";renderQuestion()}}
function renderQuestion(){const x=practiceQ[pi];$("#q-count").textContent=`Question ${pi+1} of ${practiceQ.length}`;$("#score").textContent=`Score: ${ps}`;$("#question").textContent=x.q;$("#answers").innerHTML=x.a.map((a,i)=>`<button class="answer" onclick="answer(${i})">${a}</button>`).join("")}
function answer(i){if(answered)return;answered=true;const x=practiceQ[pi],btns=[...document.querySelectorAll("#answers .answer")];btns[x.c].classList.add("correct");if(i===x.c){ps++;$("#practice-result").textContent="Correct";speak("Correct")}else{btns[i].classList.add("wrong");$("#practice-result").textContent="Try again";speak("Try again")};$("#score").textContent=`Score: ${ps}`;$("#next-question").disabled=false}

let assessmentQuestions=[],assessmentIndex=0,assessmentScore=0,assessmentAnswered=false;
function initAssessments(){
 if(!window.ASSESSMENTS)return;
 const sel=$("#assessment-level"); if(!sel)return;
 const levels=["Preschool","Nursery","Basic","JSS","SSS"];
 sel.innerHTML=levels.filter(x=>window.ASSESSMENTS[x]).map(x=>`<option>${x}</option>`).join("");
 sel.onchange=()=>resetAssessment(); $("#assessment-reset").onclick=()=>resetAssessment(); $("#assessment-next").onclick=nextAssessmentQuestion; renderAssessmentQuestion();
}
function resetAssessment(){const level=$("#assessment-level").value;assessmentQuestions=window.ASSESSMENTS[level]||[];assessmentIndex=0;assessmentScore=0;assessmentAnswered=false;renderAssessmentQuestion()}
function renderAssessmentQuestion(){if(!assessmentQuestions.length){resetAssessment();return}const x=assessmentQuestions[assessmentIndex];$("#assessment-count").textContent=`Question ${assessmentIndex+1} of ${assessmentQuestions.length}`;$("#assessment-score").textContent=`Score: ${assessmentScore}`;$("#assessment-question").textContent=x.q;$("#assessment-result").textContent="";$("#assessment-answers").innerHTML=x.a.map((a,i)=>`<button class="answer" onclick="answerAssessment(${i})">${a}</button>`).join("");$("#assessment-next").disabled=true}
function answerAssessment(i){if(assessmentAnswered)return;assessmentAnswered=true;const x=assessmentQuestions[assessmentIndex],btns=[...document.querySelectorAll("#assessment-answers .answer")];btns[x.c].classList.add("correct");if(i===x.c){assessmentScore++;$("#assessment-result").textContent="Correct";speak("Correct")}else{btns[i].classList.add("wrong");$("#assessment-result").textContent="Try again";speak("Try again")};$("#assessment-score").textContent=`Score: ${assessmentScore}`;$("#assessment-next").disabled=false}
function nextAssessmentQuestion(){if(!assessmentAnswered)return;if(assessmentIndex<assessmentQuestions.length-1){assessmentIndex++;assessmentAnswered=false;renderAssessmentQuestion()}else{$("#assessment-result").textContent=`Assessment complete. You scored ${assessmentScore}/${assessmentQuestions.length}.`;$("#assessment-next").disabled=true}}

let examQuestions=[],examIndex=0,examScore=0,examAnswered=false;
function initExam(){
 if(!window.EXAM_BANK)return;
 examQuestions=[...window.EXAM_BANK];
 const sel=$("#exam-subject"); if(!sel)return;
 const subjects=["All subjects",...new Set(examQuestions.map(x=>x.subject))];
 sel.innerHTML=subjects.map(x=>`<option>${x}</option>`).join("");
 sel.onchange=()=>resetExam(); $("#exam-reset").onclick=()=>resetExam(); $("#exam-next").onclick=nextExamQuestion; renderExamQuestion();
}
function resetExam(){const filter=$("#exam-subject").value;examQuestions=window.EXAM_BANK.filter(x=>filter==="All subjects"||x.subject===filter);examIndex=0;examScore=0;examAnswered=false;renderExamQuestion()}
function renderExamQuestion(){if(!examQuestions.length)return;const x=examQuestions[examIndex];$("#exam-count").textContent=`Question ${examIndex+1} of ${examQuestions.length}`;$("#exam-score").textContent=`Score: ${examScore}`;$("#exam-question").textContent=x.q;$("#exam-result").textContent="";$("#exam-answers").innerHTML=x.a.map((a,i)=>`<button class="answer" onclick="answerExam(${i})">${a}</button>`).join("");$("#exam-next").disabled=true}
function answerExam(i){if(examAnswered)return;examAnswered=true;const x=examQuestions[examIndex],btns=[...document.querySelectorAll("#exam-answers .answer")];btns[x.c].classList.add("correct");if(i===x.c){examScore++;$("#exam-result").textContent="Correct";speak("Correct")}else{btns[i].classList.add("wrong");$("#exam-result").textContent="Try again";speak("Try again")};$("#exam-score").textContent=`Score: ${examScore}`;$("#exam-next").disabled=false}
function nextExamQuestion(){if(!examAnswered)return;if(examIndex<examQuestions.length-1){examIndex++;examAnswered=false;renderExamQuestion()}else{$("#exam-result").textContent=`Practice complete. You scored ${examScore} / ${examQuestions.length}.`;$("#exam-next").textContent="Start again";$("#exam-next").onclick=()=>{resetExam();$("#exam-next").textContent="Next question";$("#exam-next").onclick=nextExamQuestion}}}

async function submitRegistration(e){e.preventDefault();const f=e.target,status=$("#registration-status"),data=Object.fromEntries(new FormData(f));status.textContent="Submitting…";try{const r=await post("register",data);status.textContent=r.message||"Registration submitted successfully.";if(r.ok){localStorage.setItem("tn_learner",JSON.stringify({child:data.child_name,parent:data.parent_name,email:data.email,level:data.level}));sessionStorage.setItem("tn_child_name",data.child_name);f.reset();renderLearnerHub(data.level,data.child_name);showPage("learner-hub")}}catch(err){status.textContent=err.message}}
async function submitInquiry(e){e.preventDefault();const f=e.target,status=$("#inquiry-status");status.textContent="Sending…";try{const r=await post("inquiry",Object.fromEntries(new FormData(f)));status.textContent=r.message||"Inquiry sent.";if(r.ok)f.reset()}catch(err){status.textContent=err.message}}
async function checkAccess(e){e.preventDefault();const f=e.target,status=$("#access-status"),data=Object.fromEntries(new FormData(f));status.textContent="Checking…";try{const r=await post("parent-access",data);status.textContent=r.message||"No record found.";if(r.ok){if(!r.level)throw Error("The learner's registered class could not be confirmed.");localStorage.setItem("tn_learner",JSON.stringify({child:r.child_name||data.child_name,parent:r.parent_name||"",email:data.email,level:r.level}));sessionStorage.setItem("tn_child_name",r.child_name||data.child_name);renderLearnerHub(r.level,r.child_name||data.child_name);showPage("learner-hub")}}catch(err){status.textContent=err.message}}
function renderLearnerHub(level,child){const hub=$("#learner-hub");if(!hub)return;const subjects=Object.keys(window.CURRICULUM[level]||{});$("#learner-name").textContent=child?`${child}'s Learning Hub`:"Learner Learning Hub";$("#learner-level").textContent=level;$("#learner-subjects").innerHTML=subjects.map(sub=>`<button class="hub-subject" onclick="goToSubject('${esc(level)}','${esc(sub)}')"><span>📘</span><strong>${sub}</strong><small>${(window.CURRICULUM[level][sub]||[]).length} topics</small></button>`).join("")||"<p>No subjects are assigned to this registered class yet.</p>";hub.classList.add("page-active");hub.classList.remove("hidden")}
function goToSubject(level,subject){const saved=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(saved.level!==level){showPage("learner-hub");return}$("#level-filter").value=level;buildSubjects();$("#subject-filter").value=subject;renderLessons();showPage("curriculum")}
function openLearnerCourses(){const saved=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(!saved.level){showPage("register");return}showPage("curriculum")}
function openLearnerTest(){const saved=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(!saved.level){showPage("register");return}showPage("assessments");const sel=$("#assessment-level");if(sel){sel.value=saved.level;resetAssessment()}}
function restoreLearnerHub(){try{const x=JSON.parse(localStorage.getItem("tn_learner")||"null");if(x?.level)renderLearnerHub(x.level,x.child)}catch(e){}}
function setSingleView(visibleIds){const ids=new Set(visibleIds);document.querySelectorAll("main > section").forEach(s=>s.classList.toggle("view-hidden",!ids.has(s.id)));document.querySelector("footer")?.classList.toggle("view-hidden",visibleIds.length!==4||!ids.has("home"));window.scrollTo({top:0,left:0,behavior:"smooth"})}
function initAcademyMenu(){const drawer=$("#academy-drawer"),overlay=$("#drawer-overlay"),open=$("#menu-open"),close=$("#menu-close"),hero=$("#hero-menu-open"),brand=document.querySelector(".brand");if(!drawer||!open)return;const setOpen=v=>{drawer.classList.toggle("open",v);overlay.classList.toggle("open",v);drawer.setAttribute("aria-hidden",String(!v));open.setAttribute("aria-expanded",String(v))};open.onclick=()=>setOpen(true);close.onclick=()=>setOpen(false);overlay.onclick=()=>setOpen(false);if(hero)hero.onclick=()=>setOpen(true);if(brand){brand.setAttribute("role","button");brand.setAttribute("tabindex","0");brand.onclick=()=>showHome("home");brand.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();showHome("home")}}}drawer.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{setOpen(false);showPage(b.dataset.page)});drawer.querySelectorAll("[data-home]").forEach(b=>b.onclick=()=>{setOpen(false);showHome(b.dataset.target)})}
function showPage(id){if(id==="curriculum"){const learner=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(!learner.level){showPage("register");return}}if(id==="learner-hub"){const x=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(!x.level){showPage("register");return}renderLearnerHub(x.level,x.child)}if(id==="assessments"){const x=JSON.parse(localStorage.getItem("tn_learner")||"null")||{};if(!x.level){showPage("register");return}$("#assessment-level").value=x.level;resetAssessment()}setSingleView([id]);if(id==="curriculum")renderLessons();const el=document.getElementById(id);if(el)el.classList.add("page-active")}
function showHome(target="home"){if(target==="home")return setSingleView(["home","phonics","colours-shapes","exam-prep"]);setSingleView([target])}

async function pay(plan,amount){const email=prompt("Enter the parent email to use for this payment:");if(!email)return;try{const r=await post("paystack-initialize",{email,plan,amount});if(r.authorization_url)location.href=r.authorization_url;else throw Error(r.message||"Could not start payment.")}catch(e){alert(e.message)}}
async function post(fn,body){const res=await fetch(`${API_BASE}/${fn}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await res.json().catch(()=>({}));if(!res.ok||data.ok===false)throw Error(data.message||"Something went wrong.");return data}
function openModal(html){$("#modal-content").innerHTML=html;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}

const GAME_BANK={
 scramble:[['Unscramble: T A C',['CAT','ACT','TAC','CTA'],'CAT'],['Unscramble: G O D',['DOG','GOD','DGO','OGD'],'DOG'],['Unscramble: P A M',['MAP','AMP','PAM','MOP'],'MAP']],
 math:[['What is 8 + 6?',['12','13','14','15'],'14'],['What is 9 + 7?',['14','15','16','17'],'16'],['What is 12 + 5?',['15','16','17','18'],'17']],
 phonics:[['Which letter makes the /m/ sound?',['M','N','B','P'],'M'],['Which letter starts “sun”?',['S','C','T','F'],'S'],['Which letter starts “ball”?',['B','D','P','M'],'B']],
 animals:[['Which is an animal?',['🐘','🚗','📚','🍎'],'🐘'],['Which is an animal?',['🐶','🪑','✏️','🏠'],'🐶'],['Which is an animal?',['🐟','📱','🚌','🥄'],'🐟']],
 objects:[['Which is used for writing?',['✏️','🐘','🍎','🌳'],'✏️'],['Which is furniture?',['🪑','🐱','🍌','☀️'],'🪑'],['Which is used to tell time?',['⌚','🐟','🍞','🌸'],'⌚']],
 colour:[['Choose BLUE',['🔵','🟥','🟨','🟩'],'🔵'],['Choose RED',['🟦','🟥','🟪','🟩'],'🟥'],['Choose GREEN',['🟨','🟦','🟩','🟧'],'🟩']],
 shape:[['Find the circle',['⚪','🔺','🟦','⭐'],'⚪'],['Find the triangle',['⚪','🔺','🟦','⬜'],'🔺'],['Find the square',['⚪','🔺','🟦','⭐'],'🟦']],
 memory:[['Remember: 🍎 🐟 🏠. Which was shown?',['🍎','🐘','🚗','📚'],'🍎'],['Remember: ⭐ 🐶 🍌. Which was shown?',['🐶','🚌','🌳','✏️'],'🐶']],
 counting:[['How many apples? 🍎🍎🍎',['2','3','4','5'],'3'],['How many stars? ⭐⭐⭐⭐',['3','4','5','6'],'4'],['How many fish? 🐟🐟🐟🐟🐟',['4','5','6','7'],'5']],
 letters:[['What is the first letter of “cat”?',['C','B','D','T'],'C'],['What is the first letter of “fish”?',['F','S','P','H'],'F'],['What is the first letter of “goat”?',['G','C','D','K'],'G']],
 wordbuilder:[['Build “CAT”',['CAT','DOG','SUN','PEN'],'CAT'],['Build “DOG”',['DIG','DOG','DOT','DUG'],'DOG'],['Build “SUN”',['SON','SUN','SIN','RUN'],'SUN']],
 subtraction:[['What is 10 - 4?',['4','5','6','7'],'6'],['What is 15 - 7?',['6','7','8','9'],'8'],['What is 12 - 5?',['5','6','7','8'],'7']],
 science:[['Which organ pumps blood?',['Heart','Lung','Kidney','Skin'],'Heart'],['Which gas do plants release in photosynthesis?',['Oxygen','Nitrogen','Helium','Hydrogen'],'Oxygen'],['Which is a living thing?',['Goat','Stone','Chair','Cup'],'Goat']],
 english:[['Choose the noun:',['run','beautiful','teacher','quickly'],'teacher'],['Choose the adjective:',['happy','happiness','happily','help'],'happy'],['Choose the plural of “child”:',['childs','children','childes','childrens'],'children']],
 civic:[['Which is a civic responsibility?',['Pay lawful taxes','Destroy property','Spread rumours','Break laws'],'Pay lawful taxes'],['What does tolerance mean?',['Respecting differences','Forcing agreement','Using violence','Ignoring everyone'],'Respecting differences'],['Public property should be',['Protected','Destroyed','Hidden','Sold secretly'],'Protected']]
};
const gameState={};
function startGame(type){const bank=GAME_BANK[type]||GAME_BANK.math;gameState[type]={bank,index:0,score:0};renderGame(type)}
function renderGame(type){const st=gameState[type],item=st.bank[st.index];let q=item[0],opts=item[1],correct=item[2];if(Array.isArray(opts)){openModal(`<p class="eyebrow">GAME TIME 🎮</p><h2>${q}</h2><p>Score: ${st.score} • Round ${st.index+1} of ${st.bank.length}</p><div class="game-options">${opts.map((o,i)=>`<button class="game-option" onclick="gameAnswer('${esc(type)}','${esc(o)}','${esc(correct)}')">${o}</button>`).join('')}</div><div id="game-feedback" class="result"></div>`)}else{openModal(`<p class="eyebrow">GAME TIME 🎮</p><h2>${q}</h2><p>Score: ${st.score} • Round ${st.index+1} of ${st.bank.length}</p><div class="game-options"><button class="game-option" onclick="gameAnswer('${esc(type)}','${esc(opts)}','${esc(correct)}')">${opts}</button></div><div id="game-feedback" class="result"></div>`)}}
function gameAnswer(type,choice,correct){const st=gameState[type],ok=choice===correct,box=$("#game-feedback");if(ok){st.score++;box.textContent="Correct";speak("Correct")}else{box.textContent="Try again";speak("Try again")};setTimeout(()=>{if(st.index<st.bank.length-1){st.index++;renderGame(type)}else{openModal(`<p class="eyebrow">GAME COMPLETE 🎉</p><h2>Well done!</h2><p>You scored ${st.score} out of ${st.bank.length}.</p><button class="btn primary" onclick="startGame('${esc(type)}')">Play again</button>`) }},650)}
function gameWin(expected){gameAnswer('math',expected,expected)}

/* Academy APK popup: official GitHub Release APK. */
(function setupAcademyApkPopup(){
  const popup = document.getElementById("apk-download-popup");
  const close = document.getElementById("apk-popup-close");
  const link = document.getElementById("apk-download-link");
  if(!popup || !link) return;
  const apkUrl = "https://github.com/akajenelly1/Teacher-Nelly-academy-/releases/download/v1.0.0/teacher.Nelly.young.apk";
  link.href = apkUrl;
  popup.classList.remove("hidden");
  popup.setAttribute("aria-hidden","false");
  if(close) close.addEventListener("click",()=>{
    popup.classList.add("hidden");
    popup.setAttribute("aria-hidden","true");
  });
  popup.addEventListener("click",e=>{
    if(e.target===popup){
      popup.classList.add("hidden");
      popup.setAttribute("aria-hidden","true");
    }
  });
})();
