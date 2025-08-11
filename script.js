// Navigation toggle for mobile + simple contact form handler + year fill
document.addEventListener('DOMContentLoaded', function(){
  // simple nav toggles (multiple pages have different button ids)
  function enableToggle(buttonId, linksId){
    var btn = document.getElementById(buttonId);
    var links = document.getElementById(linksId);
    if(!btn || !links) return;
    btn.addEventListener('click', function(){ 
      if(links.style.display === 'flex') links.style.display = 'none';
      else links.style.display = 'flex';
    });
  }
  enableToggle('navToggle','navLinks');
  enableToggle('navToggle2','navLinks2');
  enableToggle('navToggle3','navLinks3');
  enableToggle('navToggle4','navLinks4');

  // set year in footers
  var y = new Date().getFullYear();
  ['year','year2','year3','year4'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = y;
  });
});

// contact form (local-only: shows success message — no backend)
function submitContact(e){
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var email = document.getElementById('email').value.trim();
  var msg = document.getElementById('message').value.trim();
  var out = document.getElementById('contactMsg');
  if(!name || !email || !msg){
    out.textContent = 'Please fill all fields.';
    return false;
  }
  out.textContent = 'Thanks — message queued (local demo).';
  // reset
  document.getElementById('contactForm').reset();
  return false;
}
