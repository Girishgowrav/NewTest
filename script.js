(function(){
  // Scroll animation handler with debounce for smoother transitions
  let lastScrollY = 0;
  let ticking = false;
  
  function handleScrollAnimation(){
    const scrollY = window.scrollY || window.pageYOffset;
    const threshold = 150;
    const body = document.body;
    const wasScrolled = body?.classList.contains('scrolled');
    
    // Only update if state actually changed
    if(scrollY > threshold && !wasScrolled){
      body?.classList.add('scrolled');
    } else if(scrollY <= threshold && wasScrolled){
      body?.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  // Optimized scroll handler with requestAnimationFrame
  window.addEventListener('scroll', function(){
    if(!ticking){
      window.requestAnimationFrame(handleScrollAnimation);
      ticking = true;
    }
  }, { passive: true });
  
  // Initial check
  handleScrollAnimation();

  const category = document.getElementById('category');
  const participantsEl = document.getElementById('participants');
  const form = document.getElementById('registrationForm');
  const status = document.getElementById('formStatus');

  function renderParticipants(count){
    if(!participantsEl) return;
    participantsEl.innerHTML = '';
    for(let i=1;i<=count;i++){
      const div = document.createElement('div');
      div.className='participant';
      div.innerHTML = `
        <div>
          <label>Name</label>
          <input name="member${i}Name" required />
        </div>
        <div>
          <label>SUC</label>
          <input name="member${i}SUC" maxlength="10" minlength="10" required />
        </div>
      `;
      participantsEl.appendChild(div);
    }
  }

  if(category){
    category.addEventListener('change', ()=>{
      const val = category.value;
      renderParticipants(val==='Singles'?3:6);
    });
  }

  // init render (default Singles)
  renderParticipants(3);

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.textContent = 'Submitting...';
      const fd = new FormData(form);
      const cat = fd.get('category') || 'Singles';
      const count = cat==='Singles'?3:6;

      const payload = {
        teamName: fd.get('teamName'),
        category: cat,
        leaderPhone: fd.get('leaderPhone'),
        leaderEmail: fd.get('leaderEmail'),
        collegeBranch: fd.get('collegeBranch'),
        city: fd.get('city'),
        members: []
      };

      for(let i=1;i<=count;i++){
        const name = fd.get(`member${i}Name`);
        const suc = fd.get(`member${i}SUC`);
        if(!name || !suc || suc.length!==10){ status.textContent = `Member ${i} requires a name and a 10-character SUC.`; return; }
        payload.members.push({ name, suc });
      }

      try{
        const res = await fetch('https://script.google.com/macros/s/AKfycbxH3Q3p0EQkXU0OnlDc-MwFJnpyaqaYtDg9vG1BhSRZ5Tk4qnEuvgmhM7G_cCaZIUto/exec', {
          method:'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if(data && data.status==='success'){ status.textContent='Registered — redirecting...'; window.location.href='thankyou.html'; }
        else { status.textContent = (data && data.message) || 'Submission failed. Please try again.'; }
      }catch(err){ status.textContent = 'Network error — please try again later.'; }
    });

    const resetBtn = document.getElementById('resetForm');
    if(resetBtn) resetBtn.addEventListener('click', ()=>{ form.reset(); renderParticipants(3); status.textContent=''; });
  }
})();
