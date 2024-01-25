(function () {

  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function (e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }
})();

// Check if the current URL is login.html
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.endsWith('/login')) {
    // Clear localStorage
    localStorage.clear();
  } else if (window.location.href.endsWith('/home')) {
    if (!localStorage.getItem('user_data')) {
      window.location.href = "/login";
    } else {
      const userSpan = document.getElementById('userSpan');
      const userFullName = document.getElementById('userFullName');
      const userRole = document.getElementById('userRole');

      const user = JSON.parse(localStorage.getItem('user_data'));
      userSpan.textContent = `${user.first_name} ${user.last_name}`;
      // Remove the 'd-none' class to make it visible
      userSpan.classList.remove('d-none');
      userFullName.textContent = `${user.first_name} ${user.last_name}`;
      userRole.textContent = user.role;
    }
  }
});


async function loginUser(username, password) {
  const apiUrl = 'http://localhost:3000/login'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      throw new Error(`Failed to login: ${errorMessage}`);
    }

    // Login successful
    const responseData = await response.json();
    window.location.href = "/home";
    localStorage.setItem('user_data', JSON.stringify(responseData))
    return responseData;
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
}


function attemptLogin() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  // Check if the username and password are valid (for demonstration purposes)
  if (username != null && username != undefined && password != null && password != undefined) {
    loginUser(username, password);
  } else {
    alert('กรุณากรอกข้อมูลให้ครบ')
  }
}

async function addMember(memberData) {
  const apiUrl = 'http://localhost:3000/register'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      throw new Error(`Failed to register member: ${errorMessage}`);
    }

    // Registration successful
    const responseData = await response.json();
    console.log('Member registered successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error during member registration:', error.message);
    throw error;
  }
}

function registerMember() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var email = document.getElementById("email").value;
  var first_name = document.getElementById("first_name").value;
  var last_name = document.getElementById("last_name").value;

  memberData = {
    username: username,
    email: email,
    password: password,
    first_name: first_name,
    last_name: last_name,
    role: 'user',
  }
  if (memberData.username != undefined && memberData.email != undefined && memberData.password != undefined && memberData.first_name != undefined && memberData.last_name != undefined) {
    addMember(memberData)
      .then((response) => {
        alert(response.message)
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert('ขออภัยไม่สามารถเพิ่มผู้ใช้งานใหม่ได้')
      });
  } else {
    alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
  }
}

