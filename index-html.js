/* globals axios */

;

window.addEventListener('DOMContentLoaded', (event) => {
  create: {
    const bid = `create`
    const btn = document.getElementById(bid);
    const res = document.getElementById(`${bid}-result`);
    btn.addEventListener('click', async event => {
      try {
        btn.setAttribute("disabled", "disabled")
        console.log(`${bid} clicked`)
        window.o = (await axios.post("/api/parse/TestClass/", {
          attr: {
            name: "Test Name"
          },
        })).data
        res.innerHTML = window.o.objectId;
      } catch(e) {
        res.innerHTML = 'ERROR';
        alert('An error occurred', e);
      } finally {
        btn.removeAttribute("disabled");
      }
    });
  }
  update: {
    const bid = `update`
    const btn = document.getElementById(bid);
    const res = document.getElementById(`${bid}-result`);
    btn.addEventListener('click', async event => {
      try {
        btn.setAttribute("disabled", "disabled")
        console.log(`${bid} clicked`)
        res.innerHTML = (await axios.post("/api/parse/TestClassSub/static/Test", window.o)).data.completed;
      } catch(e) {
        res.innerHTML = 'ERROR';
        alert('An error occurred', e);
      } finally {
        btn.removeAttribute("disabled");
      }
    });
  }
  retrieve: {
    const bid = `retrieve`
    const btn = document.getElementById(bid);
    const res = document.getElementById(`${bid}-result`);
    btn.addEventListener('click', async event => {
      try {
        btn.setAttribute("disabled", "disabled")
        console.log(`${bid} clicked`)
        window.o = (await axios.get(`/api/parse/TestClass/${window.o.objectId}`)).data
        res.innerHTML = JSON.stringify(window.o, null, 2);
      } catch(e) {
        res.innerHTML = 'ERROR';
        alert('An error occurred', e);
      } finally {
        btn.removeAttribute("disabled");
      }
    });
  }
  update2: {
    const bid = `update2`
    const btn = document.getElementById(bid);
    const res = document.getElementById(`${bid}-result`);
    btn.addEventListener('click', async event => {
      try {
        btn.setAttribute("disabled", "disabled")
        console.log(`${bid} clicked`)
        res.innerHTML = (await axios.post("/api/parse/TestClassSub/static/Test2", window.o)).data.completed;
      } catch(e) {
        res.innerHTML = 'ERROR';
        alert('An error occurred', e);
      } finally {
        btn.removeAttribute("disabled");
      }
    });
  }
  retrieve2: {
    const bid = `retrieve2`
    const btn = document.getElementById(bid);
    const res = document.getElementById(`${bid}-result`);
    btn.addEventListener('click', async event => {
      try {
        btn.setAttribute("disabled", "disabled")
        console.log(`${bid} clicked`)
        window.o = (await axios.get(`/api/parse/TestClass/${window.o.objectId}`)).data
        res.innerHTML = JSON.stringify(window.o, null, 2);
      } catch(e) {
        res.innerHTML = 'ERROR';
        alert('An error occurred', e);
      } finally {
        btn.removeAttribute("disabled");
      }
    });
  }


});